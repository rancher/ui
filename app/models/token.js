import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  state: computed('expired', function() {
    if ( get(this, 'expired') ) {
      return 'expired';
    }

    return 'active';
  }),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },
  },

  availableActions: computed('actionLinks.{activate,deactivate}', 'links.{update,remove}', function () {
    let l = get(this,'links');

    var choices = [
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];

    return choices;
  }),
});
