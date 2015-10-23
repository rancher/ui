import Ember from 'ember';

export default Ember.Component.extend({
  launchConfig: null,
  hasSslListeners: null,
  balancer: null,
  allCertificates: null,

  alternates: null,

  didInitAttrs() {
    var alternates = (this.get('balancer.certificateIds')||[]).map((id) => {
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
    },
  },

  alternateCertificates: function() {
    var def = this.get('balancer.defaultCertificateId');
    return this.get('allCertificates').slice().filter((obj) => {
      return Ember.get(obj, 'id') !== def;
    });
  }.property('allCertificates.@each.id','balancer.defaultCertificateId'),

  defaultDidChange: function() {
    var def = this.get('balancer.defaultCertificateId');
    this.get('alternates').forEach((obj) => {
      if ( Ember.get(obj, 'value') === def )
      {
        Ember.set(obj,'value',null);
      }
    });
  }.observes('balancer.defaultCertificateId'),

  alternatesDidChange: function() {
    this.set('balancer.certificateIds', this.get('alternates').map((obj) => {
      return Ember.get(obj, 'value');
    }).filter((id) => { return !!id; }).uniq());
  }.observes('alternates.@each.value'),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
