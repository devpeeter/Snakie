/**
 * Main game manager that coordinates all game systems
 * Replaces the scattered global state management
 */
import { GameConfig } from '../config/GameConfig.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { InputManager } from '../input/InputManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { GameObjectPools } from '../utils/ObjectPool.js';

export class GameManager {
  constructor(userConfig = {}) {
    this.config = new GameConfig(userConfig);
    this.errorHandler = new ErrorHandler();
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager(this.config.audio);
    this.objectPools = new GameObjectPools();
    
    this.state = 'loading';
    this.gameTime = 0;
    this.deltaTime = 0;
    this.lastTime = 0;
    
    this.systems = new Map();
    this.entities = new Map();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Input event handlers
    this.inputManager.on('left', (action, type) => {
      if (type === 'down') this.handleInput('left', true);
      if (type === 'up') this.handleInput('left', false);
    });

    this.inputManager.on('right', (action, type) => {
      if (type === 'down') this.handleInput('right', true);
      if (type === 'up') this.handleInput('right', false);
    });

    this.inputManager.on('up', (action, type) => {
      if (type === 'down') this.handleInput('up', true);
      if (type === 'up') this.handleInput('up', false);
    });

    this.inputManager.on('pause', (action, type) => {
      if (type === 'down') this.togglePause();
    });

    // Window events
    window.addEventListener('blur', () => this.pause());
    window.addEventListener('focus', () => this.resume());
    window.addEventListener('beforeunload', () => this.destroy());
  }

  async initialize() {
    try {
      this.state = 'loading';
      
      // Load audio assets
      await this.audioManager.loadGameSounds();
      
      // Initialize game systems
      await this.initializeSystems();
      
      this.state = 'menu';
      console.log('Game initialized successfully');
      
    } catch (error) {
      this.errorHandler.logError('Initialization Error', error);
      this.state = 'error';
      throw error;
    }
  }

  async initializeSystems() {
    // Initialize core game systems
    // This would replace the scattered initialization in CMain
    
    // Example system registration
    // this.registerSystem('collision', new CollisionSystem(this));
    // this.registerSystem('rendering', new RenderingSystem(this));
    // this.registerSystem('ai', new AISystem(this));
  }

  registerSystem(name, system) {
    this.systems.set(name, system);
    if (system.initialize) {
      system.initialize();
    }
  }

  getSystem(name) {
    return this.systems.get(name);
  }

  handleInput(action, pressed) {
    // Centralized input handling
    const currentSystem = this.getCurrentSystem();
    if (currentSystem && currentSystem.handleInput) {
      currentSystem.handleInput(action, pressed);
    }
  }

  getCurrentSystem() {
    // Return the current active system based on game state
    switch (this.state) {
      case 'menu':
        return this.getSystem('menu');
      case 'playing':
        return this.getSystem('game');
      case 'paused':
        return this.getSystem('pause');
      default:
        return null;
    }
  }

  update(currentTime) {
    try {
      this.deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      this.gameTime += this.deltaTime;

      // Update active systems
      const currentSystem = this.getCurrentSystem();
      if (currentSystem && currentSystem.update) {
        currentSystem.update(this.deltaTime);
      }

      // Update global systems
      this.updateGlobalSystems(this.deltaTime);

    } catch (error) {
      this.errorHandler.logError('Update Error', error);
    }
  }

  updateGlobalSystems(deltaTime) {
    // Update systems that should always run
    // Audio, input, etc.
  }

  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    
    console.log(`Game state changed: ${oldState} -> ${newState}`);
    
    // Notify systems of state change
    this.systems.forEach(system => {
      if (system.onStateChange) {
        system.onStateChange(newState, oldState);
      }
    });
  }

  pause() {
    if (this.state === 'playing') {
      this.setState('paused');
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.setState('playing');
    }
  }

  togglePause() {
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    }
  }

  startGame() {
    this.setState('playing');
    this.audioManager.play('soundtrack');
  }

  endGame(score) {
    this.setState('gameover');
    this.audioManager.stop('soundtrack');
    this.audioManager.play('game_over');
    
    // Handle score saving, etc.
    this.saveScore(score);
  }

  saveScore(score) {
    try {
      const scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
      scores.push({
        score,
        date: new Date().toISOString(),
        timestamp: Date.now()
      });
      
      // Keep only top 10 scores
      scores.sort((a, b) => b.score - a.score);
      scores.splice(10);
      
      localStorage.setItem('snakeScores', JSON.stringify(scores));
    } catch (error) {
      this.errorHandler.logError('Score Save Error', error);
    }
  }

  getHighScores() {
    try {
      return JSON.parse(localStorage.getItem('snakeScores') || '[]');
    } catch (error) {
      this.errorHandler.logError('Score Load Error', error);
      return [];
    }
  }

  destroy() {
    // Cleanup all systems
    this.systems.forEach(system => {
      if (system.destroy) {
        system.destroy();
      }
    });
    
    this.inputManager.destroy();
    this.audioManager.destroy();
    this.objectPools = null;
    
    console.log('Game destroyed');
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      gameTime: this.gameTime,
      deltaTime: this.deltaTime,
      fps: 1000 / this.deltaTime,
      objectPools: this.objectPools.getStats(),
      errors: this.errorHandler.getErrors().length
    };
  }
}