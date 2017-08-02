import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),

  requestedHostId: null,

  tagName: '',
  allHosts: null,
  customOpts: false,

  init() {
    this._super(...arguments);
    let store = this.get('store');
    this.setProperties({
      allHosts: store.all('host'),
      allVolumes: store.all('volume'),
      allVolumeTemplates: store.all('volumetemplate'),
    });

    this.optsChanged();
  },

  actions: {
    defineNew() {
      this.get('modalService').toggleModal('modal-new-volume', {
        model: this.get('model.volume'),
        callback: (volume) => {
          this.set('model.volume', volume);
        },
      });
    },

    remove() {
      this.sendAction('remove');
    }
  },

  volumeChoices: function() {
    let store = this.get('store');
    let allVolumes = store.all('volume');
    let stackId = this.get('stackId');

    let out = allVolumes.slice();
    if ( this.get('isService') ) {
      store.all('volumetemplate').forEach((tpl) => {
        if ( tpl.get('stackId') === stackId ) {
          out.push(tpl);
        }
      });
    }

    return out.sortBy('displayNameScope','id');
  }.property('allVolumes.[]','allVolumeTemplates.[]','isService'),

  containerChoices: function() {
    var list = [];
    let requested = this.get('requestedHostId');

    let hosts = this.get('allHosts');
    if ( requested ) {
      let host = hosts.findBy('id', requested);
      if ( host ) {
        hosts = [host];
      } else {
        hosts = [];
      }
    }

    hosts.forEach((host) => {
      var containers = (host.get('instances')||[]).filterBy('type','container');
      list.pushObjects(containers.map(function(container) {
        return {
          group: 'Host: ' + (host.get('name') || '('+host.get('id')+')'),
          id: container.get('id'),
          name: container.get('name')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('instance.requestedHostId','allHosts.@each.instances'),

  optsChanged: function() {
    let opts = this.get('model.opts');
    if ( opts !== 'ro' && opts !== 'rw' ) {
      this.set('customOpts', true);
    }
  }.observes('model.opts'),

  showOpts: function() {
    return ['newVolume','volume','bindMount'].includes(this.get('model.mode'));
  }.property('model.mode'),
});
