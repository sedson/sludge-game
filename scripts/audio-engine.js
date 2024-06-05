export class AudioEngine {
  constructor() {
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.loops = {}
    this.oneShotBuffers = {}
    this.oneShots = {}
    this.spookyOscillators = {}
    this.base_note = 55;
    this.t = 0
    this.idx = 0
    this.otherIdx = 0
    this.seq = null
    this.seqGain = null
    this.panNode = null
    this.notes = [3,0,0,0,0,
                    9,0,0,0,0,
                    0,0,0,0,0,
                    7,0,0,0,0,
                    0,0,3,0,0,
                    3,0,0,0,0,
                    5,0,0,0,0,
                    0,0,0]
    this.otherNotes = [1,0,0,0,0,0,2,5,4,0,1,0,0,3,0,0,0]

    const waveShaper = this.audioCtx.createWaveShaper()
    waveShaper.curve = this.createLimiterCurve(100)
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

  buildOscillator(type, freq) {
    const osc = this.audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    return osc;
  }

  lowGain(gain) {
    const gainNode = new GainNode(this.audioCtx);
    gainNode.gain.value = gain
    return gainNode
  }

  async loadReverbBuffer(convolver) {
    const response = await fetch("../assets/audio/cicadas.wav");
    const audioData = await response.arrayBuffer();
    convolver.buffer = await this.audioCtx.decodeAudioData(audioData);
  }
  createSpookyOscillator(name) {
    const sp1 = this.buildOscillator("sine", 150 - Math.floor(Math.random() * 100)); //100
    const gainNode = this.lowGain(0)

    const vibrato = this.buildOscillator("sine", 100 - Math.floor(Math.random() * 5)); //93
    const vibratoGain = this.lowGain(0)
    vibratoGain.gain.setValueAtTime(50, this.audioCtx.currentTime);
    vibrato.connect(vibratoGain).connect(sp1.frequency);
    vibrato.start();

    const vibrato2 = this.buildOscillator("sine", 100 - Math.floor(Math.random() * 5)); //98
    const vibratoGain2 = this.lowGain(0)
    vibratoGain2.gain.setValueAtTime(50, this.audioCtx.currentTime);
    vibrato2.connect(vibratoGain2).connect(sp1.frequency);
    vibrato2.start();

    sp1.connect(gainNode).connect(this.limiter);
    sp1.start();

    this.spookyOscillators[name] = {
      osc: sp1,
      gain1: gainNode,
      gain2: vibratoGain,
      gain3: vibratoGain2,
    }
  }

  spookyOscillatorVolume(name, volume) {
    if (!this.spookyOscillators[name]) {
      return
    }

    const osc= this.spookyOscillators[name]
    osc.gain1.gain.value = volume
    osc.gain2.gain.value = volume
    osc.gain3.gain.value = volume
  }

  midiToFreq(midi) {
    return (440 / 32) * (2 ** ((midi - 9) / 12))
  }

    
    
  createSequencer() {
      const seq = this.buildOscillator("sine", 440.0)
    const gainNode = []
      gainNode.push(this.lowGain(0.005))
      gainNode[0].gain.value = 0
    const panNode = this.audioCtx.createStereoPanner()
    seq.connect(gainNode[0]).connect(panNode).connect(this.limiter);
    for (let i = 0; i < 8; i++) {
          const delay = this.audioCtx.createDelay(5.0); 
          const gain = this.lowGain(0.01)
          gainNode.push(gain)
          const pan = this.audioCtx.createStereoPanner()
          seq.connect(gain).connect(pan).connect(delay).connect(this.limiter);
          delay.delayTime.value = 0.1 + 0.3 * i
          gain.gain.value = 0
          pan.pan.value = -1 + (i / 14)
      }
    this.seq = seq;
    this.seqGain = gainNode;
    this.panNode = panNode;
    seq.start();
  }

  playNote(note, volume) {
    const freq = this.midiToFreq(note + this.base_note);
      this.seq.frequency.value = freq;
      for (let i = 0; i < 9; i ++) {
          this.seqGain[i].gain.setTargetAtTime(volume / (1 + i), this.audioCtx.currentTime, 0.1);
          this.seqGain[i].gain.setTargetAtTime(0, this.audioCtx.currentTime + 3, 0.04);
      }
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
    try {
      const response = await fetch(url);
      const audioData = await response.arrayBuffer();
      return this.audioCtx.decodeAudioData(audioData);
    } catch (e) {
      console.log(`Had a problem loading the file: ${url}`)
    }
  }

  async createLoop(name, url) {
    let bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = await this.loadAudioFile(url)

    let gainNode = this.audioCtx.createGain();
    gainNode.gain.value = .0

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
    
    update(dt) {
      this.t += (dt * 0.16)
    if (this.t > 2.0) {
        this.t = this.t % 1
        this.idx += 1
        this.panNode.pan.value = 2 * Math.random() - 1
        this.idx = this.idx % this.notes.length
        this.otherIdx += 1
        this.otherIdx = this.otherIdx % this.otherNotes.length
        const note = this.notes[this.idx] + this.otherNotes[this.otherIdx]
        if (note > 0) {
           this.playNote(note, 0.001)
         } else  this.playNote(0, 0)
    }
  }
}

class NoAudio {
  playOneShot() {};
  loopVolume() {};
  activateContext() {};
  createLoop() {};
  loadAudioFile() {};
  createOneShot() {};
  createSpookyOscillator() {};
  createSequencer() {};
  update(dt) {};
  midiToFreq(note) {};
}

export function createEngineAndLoadAudio() {
  let speakers;
  try {
    speakers = new AudioEngine();
  } catch (e) {
    speakers = new NoAudio();
  }
  speakers.activateContext()

  speakers.createLoop('cicadas', "./assets/audio/cicadas.wav")
  speakers.createLoop('whale', "./assets/audio/mechanical_whale.mp3")
  speakers.createLoop('sighs', "./assets/audio/giant_sighs.mp3")
  speakers.createLoop('waterglide', "./assets/audio/splashies/continuous1.mp3")
  speakers.createLoop('waterglide_ambient', "./assets/audio/splashies/continuous1.mp3")

  // Splashes
  for (const str of ['splash1', 'splash2', 'splish1', 'splish2']) {
    speakers.createOneShot(str, `./assets/audio/splashies/${str}.mp3`)
  }

  // speakers.createSpookyOscillator()
  speakers.createSequencer()

  return speakers;
}
