import { alias } from '@ember/object/computed';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

var Registry = Resource.extend({
  type: 'registry',
  serverAddress: null,
  modalService: service('modal'),

  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },

    edit: function() {
      this.get('store').find('registry').then((registries) => {
        this.get('modalService').toggleModal('modal-edit-registry', EmberObject.create({
          registries: registries,
          registry: this,
          credential: this.get('credential'),
        }));
      });
    },
  },

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate },
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}'),

  displayName: alias('displayAddress'),
  displayAddress: function() {
    var address = this.get('serverAddress').toLowerCase();
    if ( address === 'index.docker.io' )
    {
      return 'DockerHub';
    }
    else if ( address === 'quay.io' )
    {
      return 'Quay';
    }
    else
    {
      return address;
    }
  }.property('serverAddress'),

  _allCredentials: null,
  credential: function() {
    let all = this.get('_allCredentials');
    if ( !all ) {
      all = this.get('store').all('registrycredential');
      this.set('_allCredentials', all);
    }

    return all.filterBy('registryId', this.get('id')).get('lastObject');
  }.property('_allCredentials.@each.registryId','id'),
});

export default Registry;
