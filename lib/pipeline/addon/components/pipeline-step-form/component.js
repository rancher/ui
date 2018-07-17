import Component from '@ember/component';
import layout from './template';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';

const stepOneChoice = [{ id: 'scm', }];

export default Component.extend({
  intl:             service(),
  layout,
  stepsTypeChoices: null,
  type:             null,
  model:            null,
  selectedModel:    function(){
    return get(this, 'model')[get(this, 'type')]
  }.property('model', 'type'),
  init(){
    this._super(...arguments);
    var stepMode = get(this, 'modalOpts.stepMode');

    if (stepMode === 'scm'){
      set(this, 'stepsTypeChoices', stepOneChoice);
    } else {
      set(this, 'stepsTypeChoices', this.getStepsChoices());
    }
  },
  getStepsChoices() {
    const intl = get(this, 'intl')
    const stepsChoices = [{
      id:   'task',
      name: intl.t('newPipelineStep.stepType.build.stepsChoices.task'),
    }, {
      id:   'build',
      name: intl.t('newPipelineStep.stepType.build.stepsChoices.build'),
    }
    ];

    return stepsChoices
  },
});
