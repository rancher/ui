import Component from '@ember/component';
import layout from './template';

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
    return this.get('model')[this.get('type')]
  }.property('model','type'),
  stepsTypeChoices: null,
  type: null,
  model: null,
  init(){
    this._super(...arguments);
    var stepMode = this.get('modalOpts.stepMode');
    if(stepMode === 'scm'){
      this.set('stepsTypeChoices', stepOneChoice);
    }else{
      this.set('stepsTypeChoices', stepsChoices);
    }
  }
});
