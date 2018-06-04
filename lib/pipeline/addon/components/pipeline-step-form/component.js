import Component from '@ember/component';
import layout from './template';
import { get, computed } from '@ember/object';
import C from 'shared/utils/pipeline-constants';
import { alias } from '@ember/object/computed';

export default Component.extend({
  layout,

  model:   null,
  editing: null,

  type:     alias('model.type'),
  stepName: computed('type', function(){
    return `steps/step-${ get(this, 'type') }`;
  }),
  stepsChoices: C.STEPS_CHOICES,

});
