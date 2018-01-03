import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  modalService: service('modal'),
  router:       service(),

  state: 'active',

  actions: {
    edit() {
      get(this, 'router').transitionTo('secrets.detail.edit', get(this, 'id'));
    },
  },

  keys: computed('data', function() {
    return Object.keys(get(this, 'data')||{}).sort();
  }),

  firstKey: alias('keys.firstObject'),

  availableActions: computed('links.remove', function() {
    var l = get(this, 'links');

    var choices = [
      { label: 'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }),
});
