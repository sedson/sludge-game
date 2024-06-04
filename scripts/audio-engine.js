export class AudioEngine {
  constructor() {
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.loops = {}
    this.oneShotBuffers = {}
    this.oneShots = {}
  }

  async playOneShot(name, volume) {
    let bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = this.oneShotBuffers[name]

    let gainNode = this.audioCtx.createGain();
    gainNode.gain.value = volume

    bufferSource.connect(gainNode).connect(this.audioCtx.destination);
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

    bufferSource.connect(gainNode).connect(this.audioCtx.destination);
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
    console.log(gainNode)
  }
}

export function createEngineAndLoadAudio() {
  const speakers = new AudioEngine();
  speakers.activateContext()
  
  speakers.createLoop('cicadas', "../assets/audio/cicadas.wav")
  speakers.createOneShot('squeak', '../assets/audio/squeak1.m4a')

  // Splashes
  for (const str of ['splash1', 'splash2', 'splish1', 'splish2']) {
    speakers.createOneShot(str, `../assets/audio/splashies/${str}.mp3`)
  }

  return speakers;
}