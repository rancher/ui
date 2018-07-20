import Component from '@ember/component';
import { set, get } from '@ember/object';
import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';
import ModalBase from 'ui/mixins/modal-base';
import { environmentTypeObject } from 'pipeline/utils/pipelineStep';
import layout from './template';

var convertObjectToArry = function(objOrArray, revert) {
  if (revert){
    var obj = {};

    for (var i = 0; i < objOrArray.length; i++) {
      let item = objOrArray[i];
      let splited = item.split('=');

      obj[splited[0]] = splited[1];
    }

    return obj;
  } else {
    var arry = [];

    for (var key in objOrArray) {
      if (objOrArray.hasOwnProperty(key)) {
        var value = objOrArray[key];

        arry.push(`${ key  }=${  value }`);
      }
    }

    return arry;
  }
};

class StepType {
  constructor(type, val) {
    if (val){
      val.sourceCodeConfig && (type = 'scm')
      val.runScriptConfig && (type = 'task')
      val.publishImageConfig && (type = 'build')
    }
    switch (type) {
    case 'scm':
      this.type = 'scm';
      this.sourceCodeConfig = val && val.sourceCodeConfig || {
        branchCondition: 'only',
        branch:          'master'
      };
      break;
    case 'task':
      this.type = 'task';
      this.runScriptConfig = val && val.runScriptConfig || { isShell: true };
      break;
    case 'build':
      this.type = 'build';
      this.publishImageConfig = val && val.publishImageConfig || {
        'dockerfilePath': './Dockerfile',
        'buildContext':   '.',
        'tag':            ''
      };
      break;
    default:
      break;
    }
  }
}

var validationErrors = (module) => {
  var errors = [];
  let config;

  switch (module.type) {
  case 'scm':
    config = module.sourceCodeConfig;
    if (!config.url || config.url.indexOf('.git') === -1) {
      errors.push('"Repository" is required');
    }
    if (!config.branch) {
      errors.push('"Branch" is required')
    }
    break;
  case 'task':
    config = module.runScriptConfig;
    if (!config.image || config.image.trim() === '') {
      errors.push('"Image" is required');
    }
    if (!config.isShell) {
      set(module, 'shellScript', '');
    } else {
      if (!config.shellScript || config.shellScript.trim() === ''){
        errors.push('"Command" is required')
      }
      set(config, 'entrypoint', '');
      set(config, 'command', '');
    }
    break;
  case 'build':
    config = module.publishImageConfig;
    if (!config.tag || config.tag.trim() === '') {
      errors.push('"Image" is required');
    }
    if (!config.buildContext || config.buildContext.trim() === '') {
      errors.push('"Build Context" is required');
    }
    if (!config.dockerfilePath || config.dockerfilePath.trim() === '') {
      errors.push('"Dockerfile Path" is required');
    }
    break;
  }

  return errors
}

export default Component.extend(ModalBase, {
  layout,
  classNames:        ['large-modal', 'alert'],
  model:             null,
  type:              'task',
  errors:            null,
  state:             { saveDisabled: false },
  modalOpts:         alias('modalService.modalOpts'),
  pipeline:          alias('modalService.modalOpts.pipeline'),
  routeState:        alias('modalService.modalOpts.routeState'),
  editingModels:     EmberObject.create({}),
  init() {
    this._super(...arguments);
    var opts = get(this, 'modalOpts');

    if (opts.params) {
      var model = new StepType(opts.params.type, Object.assign(opts.params));

      set(this, 'type', model.type);
      if (model.runScriptConfig && model.runScriptConfig.env){
        var arryParameters = convertObjectToArry(model.runScriptConfig.env, true);

        if (model.set){
          model.set('runScriptConfig.env', arryParameters);
        } else {
          model.runScriptConfig.env = arryParameters;
        }
      }
      get(this, 'editingModels').set(model.type, model);
    } else {
      if (opts.stepMode === 'scm') {
        set(this, 'type', 'scm');
      }
      set(this, 'editingModels', EmberObject.create({}));
      get(this, 'editingModels').set(get(this, 'type'), new StepType(get(this, 'type')));
    }
  },
  actions: {
    add(success) {
      var model = get(this, 'editingModels')[get(this, 'type')];
      let modalOpts = get(this, 'modalOpts');
      var errors = validationErrors(model, modalOpts.type !== 'add');

      if (errors.length > 0) {
        set(this, 'errors', errors);
        success(false);

        return true;
      }
      if (model.runScriptConfig && model.runScriptConfig.env){
        var arryParameters = convertObjectToArry(model.runScriptConfig.env);

        if (model.set){
          model.set('runScriptConfig.env', arryParameters);
        } else {
          model.runScriptConfig.env = arryParameters;
        }
      }
      modalOpts.cb(model);
      let pipeline = get(this, 'pipeline');

      // init Step according to repo language
      if (model.sourceCodeConfig && pipeline.stages[1].name === 'build' && pipeline.stages[1].steps.length === 0){
        let routeState = get(this, 'routeState');
        let selected = environmentTypeObject(routeState.language, pipeline.stages[0].steps[0].sourceCodeConfig.url);

        pipeline.stages[1].steps.pushObject({
          type:              'task',
          'runScriptConfig': {
            image:       selected && selected.value || 'busybox:latest',
            isShell:     true,
            shellScript: selected && selected.shell || 'ls',
          }
        })
      }
      get(this, 'modalService').toggleModal();
    },
    remove() {
      get(this, 'modalOpts').rmCb();
      get(this, 'modalService').toggleModal();
    },
    cancel() {
      var type = get(this, 'type');
      var repo = get(this, 'modalOpts.params.sourceCodeConfig.url');

      set(this, 'state.saveDisabled', false);
      get(this, 'modalService').toggleModal();
      if (type === 'scm' && !repo) {
        get(this, 'router').transitionTo('authenticated.project.pipeline.pipelines');
      }
    }
  },
  observeTypeChange: function() {
    var type = get(this, 'type');
    var models = get(this, 'editingModels');

    set(this, 'state.saveDisabled', false);
    models[type] || models.set(type, new StepType(type));
  }.observes('type'),

  editing: function() {
    return get(this, 'modalOpts.type') === 'edit' ? true : false;
  }.property('modalOpts.type'),

  doneSaving() {
    this.send('cancel');
  },
});
