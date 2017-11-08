import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import C from 'ui/utils/constants';

var ApiKey = Resource.extend(PolledResource,{

  type: 'apiKey',
  publicValue: null,
  secretValue: null,
  modalService: service('modal'),

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-apikey', this);
    },
  },

  isForAccount: function() {
    return this.get('accountId') === this.get(`session.${C.SESSION.ACCOUNT_ID}`);
  }.property('accountId', `session.${C.SESSION.ACCOUNT_ID}`),

  displayName: function() {
    return this.get('name') || this.get('publicValue') || '('+this.get('id')+')';
  }.property('name','publicValue','id'),

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'action.edit',          icon: 'icon icon-edit',   action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',      icon: 'icon icon-play',   action: 'activate',     enabled: !!a.activate },
      { label: 'action.deactivate',    icon: 'icon icon-pause',  action: 'deactivate',   enabled: !!a.deactivate },
      { divider: true },
      { label: 'action.remove',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
    ];
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}'),
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ApiKey;
