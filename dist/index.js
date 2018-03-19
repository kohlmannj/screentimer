(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('Screentimer', ['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Screentimer = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getOffset = getOffset;
  exports.calculateFractionalVisibility = calculateFractionalVisibility;

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

  // @see https://github.com/nefe/You-Dont-Need-jQuery#2.3
  function getOffset(el) {
    var box = el.getBoundingClientRect();

    return {
      top: box.top + window.pageYOffset - document.documentElement.clientTop,
      left: box.left + window.pageXOffset - document.documentElement.clientLeft
    };
  }

  // @see https://stackoverflow.com/a/33860876
  function calculateFractionalVisibility(element) {
    var windowHeight = window.innerHeight;
    var docScroll = pageYOffset;

    var _getOffset = getOffset(element),
        divPosition = _getOffset.top;

    var _element$getBoundingC = element.getBoundingClientRect(),
        divHeight = _element$getBoundingC.height;

    var hiddenBefore = docScroll - divPosition;
    var hiddenAfter = divPosition + divHeight - (docScroll + windowHeight);

    if (docScroll > divPosition + divHeight || divPosition > docScroll + windowHeight) {
      return 0;
    } else {
      var result = 1;

      if (hiddenBefore > 0) {
        result -= hiddenBefore / divHeight;
      }

      if (hiddenAfter > 0) {
        result -= hiddenAfter / divHeight;
      }

      return result;
    }
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
        var element = typeof this.element === 'function' ? this.element() : this.element;

        if (!element) {
          return false;
        }

        return calculateFractionalVisibility(element) >= this.threshold;
      }
    }, {
      key: 'startTimer',
      value: function startTimer() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (force || !this.started) {
          this.looker = setInterval(this.look, this.lookInterval * 1000);
          this.reporter = setInterval(this.report, this.reportInterval * 1000);
          this.started = true;
        }
      }
    }, {
      key: 'stopTimer',
      value: function stopTimer() {
        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (force || this.started) {
          clearInterval(this.looker);
          clearInterval(this.reporter);
          this.started = false;
        }
      }
    }, {
      key: 'reset',
      value: function reset() {
        // Pass `true` to both stopTimer() and startTimer() to `force` them
        this.stopTimer(true);
        this.counter = 0;
        this.startTimer(true);
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