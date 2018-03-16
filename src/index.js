export const defaults = {
  callback: () => {},
  lookInterval: 1,
  reportInterval: 10,
};

/*! isInViewport.js | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/isInViewport */
/**
 * Determine if an element is in the viewport
 * @param  {Node}    elem The element
 * @return {Boolean}      Returns true if element is in the viewport
 */
export function isInViewport(elem) {
  var distance = elem.getBoundingClientRect();
  return (
      distance.top >= 0 &&
      distance.left >= 0 &&
      distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      distance.right <= (window.innerWidth || document.documentElement.clientWidth)
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

  startTimer() {
    if (!this.started) {
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
