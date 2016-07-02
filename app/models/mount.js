import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

const { getOwner } = Ember;

let _allMounts;
let _allContainers;

var Mount = Resource.extend({
  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),

  _allMounts                 : null,
  _allContainers             : null,

  init: function() {
    this._super();

    // this.get('store') isn't set yet at init
    var store = getOwner(this).lookup('store:main');
    if ( !_allMounts )
    {
      _allMounts = store.allUnremoved('mount');
    }

    if ( !_allContainers ) {
      _allContainers = store.allUnremoved('container');
    }

    this.setProperties({
      '_allMounts'  : _allMounts,
      '_allContainers' : _allContainers,
    });

  },


  instance: function() {
    // @TODO Better way to tell if the intance is going to be a container or a VM ahead of time
    var proxy = Ember.ObjectProxy.create({content: {}});
    this.get('store').find('container', this.get('instanceId')).then((container) => {
      proxy.set('content', container);
    }).catch(() => {
      this.get('store').find('virtualmachine', this.get('instanceId')).then((vm) => {
        proxy.set('content', vm);
      });
    });

    return proxy;
  }.property('instanceId'),

  sharedContainers: function() {
    let out           = [];
    let volumeId      = this.get('volumeId');
    let allMounts     = this.get('_allMounts');
    let allContainers = this.get('_allContainers');
    let sharedMounts  = [];

    // get all mounts with my volumeId
    sharedMounts = allMounts.filterBy('volumeId', volumeId);

    sharedMounts.forEach((mount) => {

      // find the containers for the shared mounts that are not removed
      let container = allContainers.find((container) => {

        let match         = (container.id === mount.instanceId);
        let notRemovedish = C.REMOVEDISH_STATES.indexOf(container.state) === -1;
        let notMe         = !container.get('mounts').findBy('id', this.get('id'));

        return match && notRemovedish && notMe;
      });

      if (container) {
        out.push(container);
      }

    });

    return out;
  }.property('_allContainers.@each.instanceId', 'id'),
});

Mount.reopenClass({
  reset: function() {
    _allMounts = null;
    _allContainers = null;
  },

});
export default Mount;
