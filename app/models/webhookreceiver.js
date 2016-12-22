import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Receiver = Resource.extend(PolledResource, {
  regularStore: Ember.inject.service('store'),
  intl: Ember.inject.service(),

  displayKind: function() {
    return this.get('intl').t('hookPage.' + this.get('driver') + '.label');
  }.property('driver','intl._locale'),

  opt: function() {
    return this.get(this.get('driver')+'Config');
  }.property('driver','scaleServiceConfig'),

  displayService: function() {
    let service = this.get('regularStore').getById('service', this.get('opt.serviceId'));
    return service.get('displayStack') +'/'+ service.get('displayName');
  }.property('opt.serviceId'),
});

Receiver.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Receiver;
