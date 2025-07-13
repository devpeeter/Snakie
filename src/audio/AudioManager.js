/**
 * Centralized audio management system
 * Handles loading, playing, and managing game sounds
 */
export class AudioManager {
  constructor(config = {}) {
    this.sounds = new Map();
    this.volume = config.volume || 1.0;
    this.muted = config.muted || false;
    this.enabled = config.enabled !== false;
    this.loadPromises = new Map();
    
    // Initialize Howler if available
    if (typeof Howler !== 'undefined') {
      Howler.volume(this.volume);
      Howler.mute(this.muted);
    }
  }

  async loadSound(name, url, options = {}) {
    if (this.sounds.has(name)) {
      return this.sounds.get(name);
    }

    // Return existing promise if already loading
    if (this.loadPromises.has(name)) {
      return this.loadPromises.get(name);
    }

    const loadPromise = this.createSound(name, url, options);
    this.loadPromises.set(name, loadPromise);

    try {
      const sound = await loadPromise;
      this.sounds.set(name, sound);
      this.loadPromises.delete(name);
      return sound;
    } catch (error) {
      this.loadPromises.delete(name);
      console.error(`Failed to load sound ${name}:`, error);
      throw error;
    }
  }

  createSound(name, url, options) {
    return new Promise((resolve, reject) => {
      if (!this.enabled || typeof Howl === 'undefined') {
        // Return mock sound object if audio disabled or Howl not available
        resolve(this.createMockSound());
        return;
      }

      const sound = new Howl({
        src: [url],
        volume: options.volume || 1.0,
        loop: options.loop || false,
        autoplay: false,
        preload: true,
        onload: () => resolve(sound),
        onloaderror: (id, error) => reject(new Error(`Failed to load ${name}: ${error}`)),
        onplayerror: (id, error) => {
          console.warn(`Playback error for ${name}:`, error);
          // Try to unlock audio on user interaction
          sound.once('unlock', () => sound.play());
        }
      });
    });
  }

  createMockSound() {
    return {
      play: () => null,
      stop: () => null,
      pause: () => null,
      volume: () => null,
      mute: () => null,
      playing: () => false
    };
  }

  play(name, options = {}) {
    if (!this.enabled || this.muted) return null;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound ${name} not loaded`);
      return null;
    }

    try {
      const id = sound.play();
      
      if (options.volume !== undefined) {
        sound.volume(options.volume, id);
      }
      
      return id;
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
      return null;
    }
  }

  stop(name, id) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop(id);
    }
  }

  pause(name, id) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.pause(id);
    }
  }

  setVolume(volume, name = null) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (typeof Howler !== 'undefined') {
      Howler.volume(this.volume);
    }

    if (name) {
      const sound = this.sounds.get(name);
      if (sound) {
        sound.volume(this.volume);
      }
    }
  }

  mute(muted = true) {
    this.muted = muted;
    
    if (typeof Howler !== 'undefined') {
      Howler.mute(muted);
    }
  }

  isMuted() {
    return this.muted;
  }

  getVolume() {
    return this.volume;
  }

  isPlaying(name) {
    const sound = this.sounds.get(name);
    return sound ? sound.playing() : false;
  }

  async loadGameSounds() {
    const soundsToLoad = [
      { name: 'snake_eating', url: './sounds/snake_eating.mp3' },
      { name: 'click', url: './sounds/click.mp3' },
      { name: 'game_over', url: './sounds/game_over.mp3' },
      { name: 'snake_follow', url: './sounds/snake_follow.mp3' },
      { name: 'scream', url: './sounds/scream.mp3' },
      { name: 'soundtrack', url: './sounds/soundtrack.mp3', loop: true }
    ];

    const loadPromises = soundsToLoad.map(({ name, url, loop }) =>
      this.loadSound(name, url, { loop }).catch(error => {
        console.warn(`Failed to load ${name}:`, error);
        return null;
      })
    );

    await Promise.all(loadPromises);
    console.log('Audio loading complete');
  }

  destroy() {
    this.sounds.forEach(sound => {
      if (sound.unload) {
        sound.unload();
      }
    });
    this.sounds.clear();
    this.loadPromises.clear();
  }
}