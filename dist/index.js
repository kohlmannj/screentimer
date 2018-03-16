(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.index = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getWindowScrollTop = getWindowScrollTop;
  exports.getWindowBounds = getWindowBounds;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defaults = exports.defaults = {
    callback: function callback() {},
    lookInterval: 1,
    reportInterval: 10,
    threshold: 0.5
  };

  function getWindowScrollTop() {
    if (typeof pageYOffset !== 'undefined') {
      // Most browsers except IE before 9
      return pageYOffset;
    } else {
      var B = document.body; // IE 'quirks'
      var D = document.documentElement; // IE with doctype
      D = D.clientHeight ? D : B;
      return D.scrollTop;
    }
  }

  function getWindowBounds() {
    var top = getWindowScrollTop();
    var height = window.innerHeight;

    return {
      bottom: top + height,
      height: height,
      top: getWindowScrollTop(),
      width: window.innerWidth
    };
  }

  var Screentimer = function () {
    function Screentimer(element, callback) {
      var _this = this;

      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          lookInterval = _ref.lookInterval,
          reportInterval = _ref.reportInterval,
          threshold = _ref.threshold;

      _classCallCheck(this, Screentimer);

      this.handlePageVisibilityChange = function () {
        _this.stopTimer();

        if (!document.hidden) {
          _this.startTimer();
        }
      };

      this.look = function () {
        if (_this.onScreen()) {
          _this.counter += 1;
        }
      };

      this.report = function () {
        if (_this.counter > 0) {
          var count = _this.counter;
          // Reset `this.counter` since we'll have reported the current number of intervals since the
          // last call to report().
          _this.counter = 0;

          if (typeof _this.callback === 'function') {
            _this.callback({ count: count, seconds: count * _this.lookInterval });
          }
        }
      };

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

    _createClass(Screentimer, [{
      key: 'onScreen',
      value: function onScreen() {
        var field = this.element.getBoundingClientRect();
        var viewport = getWindowBounds();

        var cond = void 0;
        var buffered = void 0;
        var partialView = void 0;

        // Field entirely within viewport
        if (field.bottom <= viewport.bottom && field.top >= 0) {
          return true;
        }

        // Field bigger than viewport
        if (field.height > viewport.height) {

          cond = viewport.bottom - field.top > viewport.height / 2 && field.bottom > viewport.height / 2;

          if (cond) {
            return true;
          }
        }

        // Partially in view
        buffered = field.height * this.threshold;
        partialView = viewport.bottom - buffered >= field.top && field.bottom - buffered > viewport.top;

        return partialView;
      }
    }, {
      key: 'startTimer',
      value: function startTimer() {
        if (!this.started) {
          this.started = true;
        }

        this.looker = setInterval(this.look, this.lookInterval * 1000);
        this.reporter = setInterval(this.report, this.reportInterval * 1000);
      }
    }, {
      key: 'stopTimer',
      value: function stopTimer() {
        clearInterval(this.looker);
        clearInterval(this.reporter);
      }
    }, {
      key: 'reset',
      value: function reset() {
        this.stopTimer();
        this.counter = 0;
        this.startTimer();
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.stopTimer();
        window.removeEventListener('visibilitychange', this.handlePageVisibilityChange);
      }
    }]);

    return Screentimer;
  }();

  exports.default = Screentimer;
});
//# sourceMappingURL=index.js.map