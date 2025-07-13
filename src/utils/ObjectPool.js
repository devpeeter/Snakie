/**
 * Object pooling system for performance optimization
 * Reduces garbage collection by reusing objects
 */
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = new Set();
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    
    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    this.active.forEach(obj => {
      this.resetFn(obj);
      this.pool.push(obj);
    });
    this.active.clear();
  }

  getStats() {
    return {
      pooled: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size
    };
  }
}

// Specialized pools for common game objects
export class GameObjectPools {
  constructor() {
    this.foodPool = new ObjectPool(
      () => ({ x: 0, y: 0, type: 0, visible: false }),
      (obj) => { obj.visible = false; obj.x = 0; obj.y = 0; },
      20
    );

    this.particlePool = new ObjectPool(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0 }),
      (obj) => { obj.life = 0; obj.x = 0; obj.y = 0; obj.vx = 0; obj.vy = 0; },
      50
    );
  }

  getFood() {
    return this.foodPool.acquire();
  }

  releaseFood(food) {
    this.foodPool.release(food);
  }

  getParticle() {
    return this.particlePool.acquire();
  }

  releaseParticle(particle) {
    this.particlePool.release(particle);
  }

  getStats() {
    return {
      food: this.foodPool.getStats(),
      particle: this.particlePool.getStats()
    };
  }
}