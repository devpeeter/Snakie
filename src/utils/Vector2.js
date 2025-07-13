/**
 * Modernized Vector2 class with better performance and API
 */
export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Static factory methods
  static zero() {
    return new Vector2(0, 0);
  }

  static one() {
    return new Vector2(1, 1);
  }

  static up() {
    return new Vector2(0, -1);
  }

  static down() {
    return new Vector2(0, 1);
  }

  static left() {
    return new Vector2(-1, 0);
  }

  static right() {
    return new Vector2(1, 0);
  }

  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  // Basic operations
  add(vector) {
    if (typeof vector === 'number') {
      this.x += vector;
      this.y += vector;
    } else {
      this.x += vector.x;
      this.y += vector.y;
    }
    return this;
  }

  subtract(vector) {
    if (typeof vector === 'number') {
      this.x -= vector;
      this.y -= vector;
    } else {
      this.x -= vector.x;
      this.y -= vector.y;
    }
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (scalar === 0) {
      console.warn('Division by zero in Vector2');
      return this;
    }
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  // Vector operations
  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  cross(vector) {
    return this.x * vector.y - this.y * vector.x;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const length = this.length();
    if (length > 0) {
      this.divide(length);
    }
    return this;
  }

  normalized() {
    return this.clone().normalize();
  }

  distance(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceSquared(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return dx * dx + dy * dy;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  angleTo(vector) {
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }

  angleBetween(vector) {
    const dot = this.dot(vector);
    const lengths = this.length() * vector.length();
    if (lengths === 0) return 0;
    return Math.acos(Math.max(-1, Math.min(1, dot / lengths)));
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  rotateAround(center, angle) {
    this.subtract(center);
    this.rotate(angle);
    this.add(center);
    return this;
  }

  lerp(vector, t) {
    t = Math.max(0, Math.min(1, t));
    this.x += (vector.x - this.x) * t;
    this.y += (vector.y - this.y) * t;
    return this;
  }

  // Utility methods
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVector(vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  equals(vector, tolerance = 0.0001) {
    return Math.abs(this.x - vector.x) < tolerance && 
           Math.abs(this.y - vector.y) < tolerance;
  }

  toString() {
    return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  toArray() {
    return [this.x, this.y];
  }

  toObject() {
    return { x: this.x, y: this.y };
  }

  // Static utility methods
  static add(a, b) {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  static subtract(a, b) {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static multiply(vector, scalar) {
    return new Vector2(vector.x * scalar, vector.y * scalar);
  }

  static distance(a, b) {
    return a.distance(b);
  }

  static lerp(a, b, t) {
    return new Vector2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  static reflect(vector, normal) {
    const dot = vector.dot(normal);
    return new Vector2(
      vector.x - 2 * dot * normal.x,
      vector.y - 2 * dot * normal.y
    );
  }
}