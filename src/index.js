export const defaults = {
  callback: () => {},
  lookInterval: 1,
  reportInterval: 10,
  threshold: 0.5,
};

export function getWindowScrollTop() {
  if (typeof pageYOffset !== 'undefined') {
      // Most browsers except IE before 9
      return pageYOffset;
  } else {
    const B = document.body; // IE 'quirks'
    let D = document.documentElement; // IE with doctype
    D = (D.clientHeight) ? D : B;
    return D.scrollTop;
  }
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
    const field = element.getBoundingClientRect();
    const viewport = getWindowBounds();

    let cond;
    let buffered;
    let partialView;

    // Field entirely within viewport
    if ((field.bottom <= viewport.bottom) && (field.top >= 0)) {
      return true;
    }

     // Field bigger than viewport
    if (field.height > viewport.height) {

      cond = (viewport.bottom - field.top) > (viewport.height / 2) && field.bottom > (viewport.height / 2);

      if (cond) {
        return true;
      }

    }

    // Partially in view
    buffered = field.height * this.threshold;
    partialView = ((viewport.bottom - buffered) >= field.top && (field.bottom - buffered) > viewport.top);

    return partialView;
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
