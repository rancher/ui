import Component from '@ember/component';
import layout from './template';
import C from 'ui/utils/constants';

const choices = C.VOLUME_POLICIES;

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  model:         null,
  basicPolicies: null,
  readOnly:      false,

  volumeChoices: null,

  statusClass: null,
  status:      null,
  init() {
    this._super(...arguments);
    this.initVolume();
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    modifyVolumes(type, select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      this.set('model.volumes', selectedOptions);
    },
  },

  initVolume() {
    this.set('model.volumes', this.get('model.volumes') || []);
    this.set('volumeChoices', choices);
  },

});
