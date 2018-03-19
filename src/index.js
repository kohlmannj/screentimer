export const defaults = {
  callback: () => {},
  lookInterval: 1,
  reportInterval: 10,
  threshold: 0.5,
};

// @see https://github.com/nefe/You-Dont-Need-jQuery#2.3
export function getOffset(el) {
  const box = el.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset - document.documentElement.clientTop,
    left: box.left + window.pageXOffset - document.documentElement.clientLeft
  };
}

// @see https://stackoverflow.com/a/33860876
export function calculateFractionalVisibility(element) {
  const windowHeight = window.innerHeight;
  const docScroll = pageYOffset;
  const { top: divPosition } = getOffset(element);
  const { height: divHeight } = element.getBoundingClientRect();
  const hiddenBefore = docScroll - divPosition;
  const hiddenAfter = (divPosition + divHeight) - (docScroll + windowHeight);

  if ((docScroll > divPosition + divHeight) || (divPosition > docScroll + windowHeight)) {
    return 0;
  } else {
    let result = 1;

    if (hiddenBefore > 0) {
        result -= hiddenBefore / divHeight;
    }

    if (hiddenAfter > 0) {
        result -= hiddenAfter / divHeight;
    }

    return result;
  }
}

export default class Screentimer {
  constructor(element, callback, { lookInterval, reportInterval, threshold } = {}) {
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
    const element = typeof this.element === 'function' ? this.element() : this.element;
    
    if (!element) {
      return false;
    }
  
    return calculateFractionalVisibility(element) >= this.threshold;
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
