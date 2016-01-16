import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Mount = Resource.extend({
  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),

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
});

export default Mount;
