export const defaults = {
  callback: () => {},
  lookInterval: 1,
  reportInterval: 10,
};

export function isInViewport(element) {
  if (!element) {
    return false;
  }

  const range = { top: 0, height: 1 };
  const wH = window.innerHeight;
  const bcr = element.getBoundingClientRect();
  const top = bcr.top + pageYOffset;
  const height = bcr.height;
  const bottom = top + height;

  return (
    pageYOffset + (wH * (range.top + range.height)) > top &&
    pageYOffset + (wH * range.top) < bottom
  );
}

export default class Screentimer {
  constructor(element, callback, { lookInterval, reportInterval } = {}) {
    this.looker = null;
    this.reporter = null;

    this.counter = 0;
    this.started = false;

    this.element = element;

    if (!this.element) {
      throw new Error('Screentimer constructor: `element` argument is falsy');
    }

    this.callback = callback || defaults.callback;
    this.lookInterval = lookInterval || defaults.lookInterval;
    this.reportInterval = reportInterval || defaults.reportInterval;

    this.startTimer();

    // Attach window event listener to handle timer starts and stops based on page visibility
    window.addEventListener('visibilitychange', this.handlePageVisibilityChange);
  }

  handlePageVisibilityChange = () => {
    this.stopTimer();

    if (!document.hidden) {
      this.startTimer();
    }
  };

  onScreen() {
    const element = typeof this.element === 'function' ? this.element() : this.element;

    if (!element) {
      return false;
    }
    
    const inViewport = isInViewport(element);

    return isInViewport(element);
  }

  look = () => {
    if (this.onScreen()) {
      this.counter += 1;
    }
  };

  report = () => {
    if (this.counter > 0) {
      const count = this.counter;
      // Reset `this.counter` since we'll have reported the current number of intervals since the
      // last call to report().
      this.counter = 0;

      if (typeof this.callback === 'function') {
        this.callback({ count, seconds: count * this.lookInterval });
      }
    }
  }

  startTimer(force = false) {
    if (force || !this.started) {
      this.looker = setInterval(this.look, this.lookInterval * 1000);
      this.reporter = setInterval(this.report, this.reportInterval * 1000);
      this.started = true;
    }
  }

  stopTimer(force = false) {
    if (force || this.started) {
      clearInterval(this.looker);
      clearInterval(this.reporter);
      this.started = false;
    }
  }

  reset() {
    // Pass `true` to both stopTimer() and startTimer() to `force` them
    this.stopTimer(true);
    this.counter = 0;
    this.startTimer(true);
  }

  destroy() {
    this.stopTimer();
    window.removeEventListener('visibilitychange', this.handlePageVisibilityChange);
  }
}
