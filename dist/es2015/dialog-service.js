var _class, _temp;

import { Origin } from 'aurelia-metadata';
import { Container } from 'aurelia-dependency-injection';
import { CompositionEngine, ViewSlot } from 'aurelia-templating';
import { DialogController } from './dialog-controller';
import { Renderer } from './renderer';
import { invokeLifecycle } from './lifecycle';
import { DialogResult } from './dialog-result';

export let DialogService = (_temp = _class = class DialogService {

  constructor(container, compositionEngine) {
    this.container = container;
    this.compositionEngine = compositionEngine;
    this.controllers = [];
    this.hasActiveDialog = false;
  }

  open(settings) {
    let dialogController;

    let promise = new Promise((resolve, reject) => {
      let childContainer = this.container.createChild();
      dialogController = new DialogController(childContainer.get(Renderer), settings, resolve, reject);
      childContainer.registerInstance(DialogController, dialogController);
      let host = dialogController.renderer.getDialogContainer();

      let instruction = {
        container: this.container,
        childContainer: childContainer,
        model: dialogController.settings.model,
        viewModel: dialogController.settings.viewModel,
        viewSlot: new ViewSlot(host, true),
        host: host
      };

      return _getViewModel(instruction, this.compositionEngine).then(returnedInstruction => {
        dialogController.viewModel = returnedInstruction.viewModel;
        dialogController.slot = returnedInstruction.viewSlot;

        return invokeLifecycle(dialogController.viewModel, 'canActivate', dialogController.settings.model).then(canActivate => {
          if (canActivate) {
            this.controllers.push(dialogController);
            this.hasActiveDialog = !!this.controllers.length;

            return this.compositionEngine.compose(returnedInstruction).then(controller => {
              dialogController.controller = controller;
              dialogController.view = controller.view;

              return dialogController.renderer.showDialog(dialogController);
            });
          }
        });
      });
    });

    return promise.then(result => {
      let i = this.controllers.indexOf(dialogController);
      if (i !== -1) {
        this.controllers.splice(i, 1);
        this.hasActiveDialog = !!this.controllers.length;
      }

      return result;
    });
  }
}, _class.inject = [Container, CompositionEngine], _temp);

function _getViewModel(instruction, compositionEngine) {
  if (typeof instruction.viewModel === 'function') {
    instruction.viewModel = Origin.get(instruction.viewModel).moduleId;
  }

  if (typeof instruction.viewModel === 'string') {
    return compositionEngine.ensureViewModel(instruction);
  }

  return Promise.resolve(instruction);
}