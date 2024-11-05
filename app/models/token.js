import Resource from 'ember-api-store/models/resource';
import { computed, set } from '@ember/object';
import { next } from '@ember/runloop'
import { inject as service } from '@ember/service';

export default Resource.extend({
  growl: service(),

  state: computed('expired', function() {
    if ( this.expired ) {
      return 'expired';
    }

    return 'active';
  }),

  availableActions: computed('enabled', function() { // eslint-disable-line

    return [
      {
        label:      'action.activate',
        icon:       'icon icon-play',
        action:     'activate',
        // enabled: !this.enabled,
        enabled:    false, // backend was supposed to be ready but its not ready, when it is flip this switch and bingo bango yor're off to the races
        bulkable:   false
      },
      {
        label:      'action.deactivate',
        icon:       'icon icon-pause',
        action:     'deactivate',
        // enabled: this.enabled,
        enabled:    false, // backend was supposed to be ready but its not ready, when it is flip this switch and bingo bango yor're off to the races
        bulkable:   false
      },
    ];
  }),

  actions: {
    deactivate() {
      next(() => {
        set(this, 'enabled', false);
        this.save().catch((err) => {
          set(this, 'enabled', true);
          this.growl.fromError('Error deactivating token', err)
        });
      });
    },

    activate() {
      next(() => {
        set(this, 'enabled', true);
        this.save().catch((err) => {
          set(this, 'enabled', false);
          this.growl.fromError('Error activating token', err)
        });
      });
    },
  },
});
