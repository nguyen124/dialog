'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogController = undefined;

var _lifecycle = require('./lifecycle');

var _dialogResult = require('./dialog-result');



var DialogController = exports.DialogController = function () {
  function DialogController(renderer, settings, resolve, reject) {
    

    var defaultSettings = renderer ? renderer.defaultSettings || {} : {};

    this.renderer = renderer;
    this.settings = Object.assign({}, defaultSettings, settings);
    this._resolve = resolve;
    this._reject = reject;
  }

  DialogController.prototype.ok = function ok(output) {
    return this.close(true, output);
  };

  DialogController.prototype.cancel = function cancel(output) {
    return this.close(false, output);
  };

  DialogController.prototype.error = function error(message) {
    var _this = this;

    return (0, _lifecycle.invokeLifecycle)(this.viewModel, 'deactivate').then(function () {
      return _this.renderer.hideDialog(_this);
    }).then(function () {
      _this.controller.unbind();
      _this._reject(message);
    });
  };

  DialogController.prototype.close = function close(ok, output) {
    var _this2 = this;

    return (0, _lifecycle.invokeLifecycle)(this.viewModel, 'canDeactivate').then(function (canDeactivate) {
      if (canDeactivate) {
        return (0, _lifecycle.invokeLifecycle)(_this2.viewModel, 'deactivate').then(function () {
          return _this2.renderer.hideDialog(_this2);
        }).then(function () {
          var result = new _dialogResult.DialogResult(!ok, output);
          _this2.controller.unbind();
          _this2._resolve(result);
          return result;
        });
      }

      return Promise.resolve();
    });
  };

  return DialogController;
}();