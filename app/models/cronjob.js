import Workload from 'ui/models/workload';
import { get, set, computed } from '@ember/object';

const CronJob = Workload.extend({
  combinedState: computed('state', 'cronJobConfig.suspend', function() {
    var service = get(this, 'state');

    if (service === 'active' && get(this, 'cronJobConfig.suspend')) {
      return 'suspended';
    }

    return service;
  }),

  availableActions: computed('actionLinks.{activate,deactivate,pause,restart,rollback,garbagecollect}', 'links.{update,remove}', 'podForShell', 'isPaused', 'canEdit', function() {
    const actions = this._super();
    const canEdit = get(this, 'canEdit');
    const suspend = get(this, 'cronJobConfig.suspend');

    actions.pushObjects([
      {
        label:    'action.suspend',
        icon:     'icon icon-pause',
        action:   'suspend',
        enabled:  canEdit && !suspend,
        bulkable: false,
      }, {
        label:    'action.resumeCronjob',
        icon:     'icon icon-play',
        action:   'resume',
        enabled:  canEdit && suspend,
        bulkable: false,
      }]);

    return actions;
  }),

  actions: {
    suspend() {
      set(this, 'cronJobConfig.suspend', true);
      this.save();
    },

    resume() {
      set(this, 'cronJobConfig.suspend', false);
      this.save();
    },
  },
});

export default CronJob;
