import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  expiresAt: computed('created','ttl', function() {
    const created = get(this, 'created');
    const ttl = get(this, 'ttl');

    if ( created && ttl ) {
      return moment(created).add(ttl,'ms').toDate();
    }

    return null;
  }),

  expired: computed('expiresAt', function() {
    const expiresDate = get(this,'expiresAt');
    if ( !expiresDate ) {
      return false;
    }

    const now = moment();
    return now.diff(moment(expiresDate)) > 0;
  }).volatile(),

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
    let a = get(this,'actionLinks');
    let l = get(this,'links');

    var choices = [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',    icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate, bulkable: true},
      { label: 'action.deactivate',  icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate, bulkable: true},
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];

    return choices;
  }),
});
