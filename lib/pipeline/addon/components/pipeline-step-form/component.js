import Component from '@ember/component';
import layout from './template';
import { set, get } from '@ember/object';

const stepOneChoice = [{
  id: 'scm',
}];

const stepsChoices = [{
    id: 'task',
    name: 'run a script'
  },{
    id: 'build',
    name: 'publish an image'
  }
];

export default Component.extend({
  layout,
  selectedModel: function(){
    return get(this, 'model')[get(this, 'type')]
  }.property('model','type'),
  stepsTypeChoices: null,
  type: null,
  model: null,
  init(){
    this._super(...arguments);
    var stepMode = get(this, 'modalOpts.stepMode');
    if(stepMode === 'scm'){
      set(this, 'stepsTypeChoices', stepOneChoice);
    }else{
      set(this, 'stepsTypeChoices', stepsChoices);
    }
  }
});
