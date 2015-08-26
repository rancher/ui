import Ember from 'ember';

export default Ember.Component.extend({
  launchConfig: null,
  balancerService: null,
  certificates: null,

  alternates: null,

  didInitAttrs() {
    var alternates = (this.get('balancerService.certificateIds')||[]).map((id) => {
      return {value: id};
    });

    this.set('alternates', alternates);
  },

  actions: {
    addAlternate() {
      this.get('alternates').pushObject({value: null});
    },

    removeAlternate(alt) {
      this.get('alternates').removeObject(alt);
    }
  },

  alternateCertificates: function() {
    var def = this.get('balancerService.defaultCertificateId');
    return this.get('certificates').slice().filter((obj) => {
      return Ember.get(obj, 'value') !== def;
    });
  }.property('certificates.[]','balancerService.defaultCertificateId'),

  hasSslListeners: function() {
    return (this.get('launchConfig.ports')||[]).filter((port) => {
      return port.match(/\/(ssl|https)/);
    }).get('length') > 0;
  }.property('launchConfig.ports.[]'),

  alternatesDidChange: function() {
    this.set('balancerService.certificateIds', this.get('alternates').map((obj) => {
      return Ember.get(obj, 'value');
    }).uniq());
  }.observes('alternates.@each.value'),
});
