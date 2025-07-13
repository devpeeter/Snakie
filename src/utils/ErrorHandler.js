/**
 * Centralized error handling system
 */
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }

  logError(type, error, context = {}) {
    const errorInfo = {
      type,
      message: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      context
    };

    this.errors.push(errorInfo);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    console.error(`[${type}]`, errorInfo);
    
    // Could send to analytics service here
    this.reportError(errorInfo);
  }

  reportError(errorInfo) {
    // Placeholder for error reporting service
    // Could integrate with Sentry, LogRocket, etc.
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorHandler = new ErrorHandler();