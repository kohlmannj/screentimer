export const defaults = {
  callback: () => {},
  lookInterval: 1,
  reportInterval: 10,
  threshold: 0.5,
};

export function getWindowScrollTop() {
  return (
    document.documentElement.scrollTop || 
    document.body.parentNode.scrollTop ||
    document.body.scrollTop
  );
}

export function getWindowBounds() {
  const top = getWindowScrollTop();
  const height = window.innerHeight;

  return {
    bottom: top + height,
    height,
    top: getWindowScrollTop(),
    width: window.innerWidth
  }
}

export default class Screentimer {
  constructor(element, callback, { lookInterval, reportInterval, threshold }) {
    this.looker = null;
    this.reporter = null;

    this.counter = 0;
    this.started = false;

    this.element = element;
    this.callback = callback || defaults.callback;
    this.lookInterval = lookInterval || defaults.lookInterval;
    this.reportInterval = reportInterval || defaults.reportInterval;
    this.threshold = threshold || defaults.threshold;

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
    const windowBounds = getWindowBounds();
    const elementBounds = this.element.getBoundingClientRect();

    // Element is entirely within the window bounds
    if (elementBounds.bottom <= windowBounds.bottom && elementBounds.top >= windowBounds.top) {
      return true;
    }

    // Element bounds are larger than that of the window bounds
    if (elementBounds.height > windowBounds.height) {
      return (
        (windowBounds.bottom - elementBounds.top) > (windowBounds.height / 2) &&
        (elementBounds.bottom - windowBounds.top) > (windowBounds.height / 2)
      );
    }

    // Element is partially in view
    const buffered = elementBounds.height * this.threshold;
    return (
      (windowBounds.bottom - buffered) >= elementBounds.top &&
      (elementBounds.bottom - buffered) > windowBounds.top
    );
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
        this.callback(count);
      }
    }
  }

  startTimer() {
    if (!this.started) {
      this.look();
      this.started = true;
    }

    this.looker = setInterval(this.look, this.lookInterval * 1000)
    this.reporter = setInterval(this.report, this.reportInterval * 1000);
  }

  stopTimer() {
    clearInterval(this.looker);
    clearInterval(this.reporter);
  }

  reset() {
    this.stopTimer();
    this.counter = 0;
    this.startTimer();
  }

  destroy() {
    this.stopTimer();
    window.removeEventListener('visibilitychange', this.handlePageVisibilityChange);
  }
}
