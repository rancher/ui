import Ember from 'ember';

export default Ember.Component.extend({
  launchConfig: null,
  listenersArray: null,
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
      return Ember.get(obj, 'id') !== def;
    });
  }.property('certificates.@each.id','balancerService.defaultCertificateId'),

  hasSslListeners: function() {
    return this.get('listenersArray').filterBy('ssl',true).get('length') > 0;
  }.property('listenersArray.@each.ssl'),

  defaultDidChange: function() {
    var def = this.get('balancerService.defaultCertificateId');
    this.get('alternates').forEach((obj) => {
      if ( Ember.get(obj, 'value') === def )
      {
        Ember.set(obj,'value',null);
      }
    });
  }.observes('balancerService.defaultCertificateId'),

  alternatesDidChange: function() {
    this.set('balancerService.certificateIds', this.get('alternates').map((obj) => {
      return Ember.get(obj, 'value');
    }).filter((id) => { return !!id; }).uniq());
  }.observes('alternates.@each.value'),
});
