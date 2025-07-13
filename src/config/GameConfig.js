/**
 * Centralized game configuration
 * Replaces scattered global variables from settings.js
 */
export class GameConfig {
  constructor(userConfig = {}) {
    // Canvas settings
    this.canvas = {
      width: 1360,
      height: 768,
      get widthHalf() { return this.width * 0.5; },
      get heightHalf() { return this.height * 0.5; }
    };

    // Gameplay settings
    this.gameplay = {
      heroSpeed: 10,
      heroSpeedUp: 15,
      heroRotationSpeed: 10,
      maxAIFollowers: 1,
      foodSpawnInterval: 500,
      snakeTypes: 5,
      playerType: 4,
      enemyTypes: [0, 1, 2, 3]
    };

    // Audio settings
    this.audio = {
      enabled: true,
      volume: 1.0,
      disableSoundMobile: false
    };

    // Performance settings
    this.performance = {
      fps: 30,
      objectPoolSize: 50,
      maxFoodsInstance: 100
    };

    // UI settings
    this.ui = {
      fontFamily: "palamecia_titlingregular",
      edgeboardX: 175,
      edgeboardY: 90
    };

    // Merge user configuration
    this.merge(userConfig);
  }

  merge(userConfig) {
    Object.keys(userConfig).forEach(key => {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        this[key] = { ...this[key], ...userConfig[key] };
      } else {
        this[key] = userConfig[key];
      }
    });
  }

  static fromJSON(json) {
    return new GameConfig(JSON.parse(json));
  }

  toJSON() {
    return JSON.stringify(this, null, 2);
  }
}