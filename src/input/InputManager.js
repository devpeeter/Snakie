/**
 * Unified input management system
 * Handles keyboard, mouse, and touch inputs
 */
export class InputManager {
  constructor() {
    this.keys = new Set();
    this.touches = new Map();
    this.bindings = new Map();
    this.callbacks = new Map();
    this.enabled = true;
    
    this.setupEventListeners();
    this.setupDefaultBindings();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Touch events
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    
    // Mouse events
    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  setupDefaultBindings() {
    this.bind('left', 'ArrowLeft', 'KeyA');
    this.bind('right', 'ArrowRight', 'KeyD');
    this.bind('up', 'ArrowUp', 'KeyW');
    this.bind('down', 'ArrowDown', 'KeyS');
    this.bind('pause', 'Space', 'Escape');
  }

  bind(action, ...inputs) {
    this.bindings.set(action, inputs);
  }

  on(action, callback) {
    if (!this.callbacks.has(action)) {
      this.callbacks.set(action, []);
    }
    this.callbacks.get(action).push(callback);
  }

  off(action, callback) {
    const callbacks = this.callbacks.get(action);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  isPressed(action) {
    if (!this.enabled) return false;
    
    const inputs = this.bindings.get(action) || [];
    return inputs.some(input => this.isInputActive(input));
  }

  isInputActive(input) {
    // Check keyboard
    if (this.keys.has(input)) return true;
    
    // Check touch (simplified)
    if (this.touches.size > 0) {
      // Touch logic would depend on screen regions
      return false;
    }
    
    return false;
  }

  handleKeyDown(event) {
    if (!this.enabled) return;
    
    this.keys.add(event.code);
    this.triggerAction(event.code, 'down');
    
    // Prevent default for game keys
    if (this.isGameKey(event.code)) {
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    if (!this.enabled) return;
    
    this.keys.delete(event.code);
    this.triggerAction(event.code, 'up');
  }

  handleTouchStart(event) {
    if (!this.enabled) return;
    
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startTime: Date.now()
      });
    });
    
    this.processTouchInput(event);
  }

  handleTouchEnd(event) {
    if (!this.enabled) return;
    
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.delete(touch.identifier);
    });
  }

  handleTouchMove(event) {
    if (!this.enabled) return;
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (touchData) {
        touchData.x = touch.clientX;
        touchData.y = touch.clientY;
      }
    });
  }

  handleMouseDown(event) {
    if (!this.enabled) return;
    this.processMouseInput(event, 'down');
  }

  handleMouseUp(event) {
    if (!this.enabled) return;
    this.processMouseInput(event, 'up');
  }

  handleMouseMove(event) {
    if (!this.enabled) return;
    // Store mouse position for reference
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  processTouchInput(event) {
    // Simple touch to action mapping
    const touch = event.touches[0];
    if (!touch) return;
    
    const screenWidth = window.innerWidth;
    const x = touch.clientX;
    
    if (x < screenWidth * 0.5) {
      this.triggerAction('left', 'touch');
    } else {
      this.triggerAction('right', 'touch');
    }
  }

  processMouseInput(event, type) {
    // Convert mouse clicks to actions if needed
    const screenWidth = window.innerWidth;
    
    if (event.clientX < screenWidth * 0.5) {
      this.triggerAction('left', type);
    } else {
      this.triggerAction('right', type);
    }
  }

  triggerAction(input, type) {
    // Find actions bound to this input
    for (const [action, inputs] of this.bindings) {
      if (inputs.includes(input)) {
        this.executeCallbacks(action, type);
      }
    }
  }

  executeCallbacks(action, type) {
    const callbacks = this.callbacks.get(action);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(action, type);
        } catch (error) {
          console.error('Error in input callback:', error);
        }
      });
    }
  }

  isGameKey(code) {
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    return gameKeys.includes(code);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.keys.clear();
    this.touches.clear();
  }

  destroy() {
    this.disable();
    this.callbacks.clear();
    this.bindings.clear();
  }
}