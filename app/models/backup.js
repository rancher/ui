import Resource from 'ember-api-store/models/resource';
import { denormalizeId} from 'ember-api-store/utils/denormalize';

var Backup = Resource.extend({
  type: 'backup',

  volume: denormalizeId('volumeId'),

  actions: {
    restoreFromBackup() {
      this.get('volume').doAction('restorefrombackup', {
        backupId: this.get('id'),
      });
    },
  },

  availableActions: function() {
    let a = this.get('actionLinks');
    var volA = this.get('volume.actionLinks');

    let created = this.get('state') === 'created';

    return [
      { label: 'action.remove',    icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'action.restoreFromBackup', icon: 'icon icon-history', action: 'restoreFromBackup', enabled: created && volA && !!volA.restorefrombackup },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.remove','volume.actionLinks.restorefrombackup','state','volume.state'),

});

export default Backup;
