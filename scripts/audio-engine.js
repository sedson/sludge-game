export class AudioEngine {
  constructor() {
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.loops = {}
    this.oneShotBuffers = {}
    this.oneShots = {}

    const waveShaper = this.audioCtx.createWaveShaper()
    waveShaper.curve = this.createLimiterCurve(50)
    waveShaper.oversample = '4x'
    waveShaper.connect(this.audioCtx.destination)
    this.limiter = waveShaper
    // createOscillator()
  }

  // Step 4: Define the curve
  createLimiterCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const k = typeof amount === 'number' ? amount : 50;

    for (let i = 0; i < samples; ++i) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  createOscillator() {
    const oscillator = this.audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    const gainNode = new GainNode(this.audioCtx);
    gainNode.gain.value = .01
    oscillator.connect(gainNode).connect(this.limiter);
    oscillator.start();
  }

  buildOscillator(type, freq) {
    const osc = this.audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    return osc;
  }

  lowGain(gain){
    const gainNode = new GainNode(this.audioCtx);
    gainNode.gain.value = gain || .01
    return gainNode
  }

  createSpookyOscillator() {
    const sp1 = this.buildOscillator("sine", 100);
    const gainNode = this.lowGain(.005)
    sp1.connect(gainNode).connect(this.limiter);
    sp1.start()

    // // Vibrato effect (frequency modulation)
    const vibrato = this.buildOscillator("sine", 93);
    const vibratoGain = this.lowGain(.005)
    vibratoGain.gain.setValueAtTime(50, this.audioCtx.currentTime);
    vibrato.connect(vibratoGain).connect(sp1.frequency);
    vibrato.start();

    const vibrato2 = this.buildOscillator("sine", 98);
    const vibratoGain2 = this.lowGain()
    vibratoGain2.gain.setValueAtTime(50, this.audioCtx.currentTime);
    vibrato2.connect(vibratoGain2).connect(sp1.frequency);
    vibrato2.start();

  }

  async playOneShot(name, volume) {
    let bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = this.oneShotBuffers[name]

    let gainNode = this.audioCtx.createGain();
    gainNode.gain.value = volume

    bufferSource.connect(gainNode).connect(this.limiter);
    bufferSource.start()
  }

  async createOneShot(name, url) {
    this.oneShotBuffers[name] = await this.loadAudioFile(url)
  }

  async loadAudioFile(url) {
    const response = await fetch(url);
    const audioData = await response.arrayBuffer();
    return this.audioCtx.decodeAudioData(audioData);
  }

  async createLoop(name, url) {
    let bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = await this.loadAudioFile(url)

    let gainNode = this.audioCtx.createGain();
    gainNode.gain.value = .06

    bufferSource.connect(gainNode).connect(this.limiter);
    bufferSource.loop = true;
    bufferSource.start();
    this.loops[name] = {
      source: bufferSource,
      gain: gainNode
    }
  }

  async activateContext() {
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  async loopVolume(loopName, volume, additive = false) {
    if (!this.loops[loopName]) {
      return
    }

    if (additive) volume += this.loops[loopName].gain.gain.value

    const gainNode = this.loops[loopName].gain
    gainNode.gain.value = volume
  }
}

class NoAudio {
  playOneShot() {};
  loopVolume() {};
  activateContext() {};
  createLoop() {};
  loadAudioFile() {};
  createOneShot() {};
}

export function createEngineAndLoadAudio() {
  let speakers;
  try {
    speakers = new AudioEngine();
  } catch (e) {
    speakers = new NoAudio();
  }
  speakers.activateContext()

  speakers.createLoop('cicadas', "../assets/audio/cicadas.wav")
  speakers.createLoop('waterglide', "../assets/audio/splashies/continuous1.mp3")
  speakers.createLoop('waterglide_ambient', "../assets/audio/splashies/continuous1.mp3")

  // Splashes
  for (const str of ['splash1', 'splash2', 'splish1', 'splish2']) {
    speakers.createOneShot(str, `../assets/audio/splashies/${str}.mp3`)
  }

  speakers.createSpookyOscillator()


  return speakers;
}