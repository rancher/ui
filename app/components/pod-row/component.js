import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  scope:             service(),
  session:           service(),

  layout,
  model:             null,
  showStats:         false,
  bulkActions:       true,
  expandPlaceholder: false,
  scalePlaceholder:  false,
  cpuMax:            null,
  memoryMax:         null,
  storageMax:        null,
  networkMax:        null,
  showActions:       true,
  tagName:           '',
  expanded:          null,

  containers: alias('model.containers'),
  actions:    {
    toggle() {
      if (this.toggle) {
        this.toggle(this.model.id);
      }
    },
  },

  canExpand:  computed('expandPlaceholder', 'model.containers', function() {
    return get(this, 'expandPlaceholder') && get(this, 'model.containers.length') > 1;
  }),

  statsAvailable: computed('model.{state,healthState}', function() {
    return C.ACTIVEISH_STATES.indexOf(this.get('model.state')) >= 0 && this.get('model.healthState') !== 'started-once';
  }),

});
