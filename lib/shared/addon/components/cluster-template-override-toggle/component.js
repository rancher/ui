import Component from '@ember/component';
import layout from './template';
import { computed, set } from '@ember/object';

export default Component.extend({
  layout,

  path:           null,
  configVariable: null,
  questions:      null,
  btnToggled:     false,
  tagName:        '',

  didReceiveAttrs() {
    let { path, questions } = this;

    if (path && questions && questions.length ) {
      let match = questions.findBy('variable', path);

      if (match && !match.hideQuestion) {
        set(this, 'btnToggled', true);
      }
    }
  },

  actions: {
    addOverride(enabeld) {
      this.addOverride(enabeld, this.tooltipModel);
    },
  },

  tooltipModel: computed('path', 'configVariable', function() {
    const { path, configVariable } = this;

    return {
      path,
      configVariable
    };
  }),

  addOverride() {
    throw new Error('addOverride action is required!');
  },
});
