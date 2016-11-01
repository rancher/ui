import Ember from 'ember';

export default Ember.Component.extend({
  service         : null,
  allCertificates : null,

  lbConfig: Ember.computed.alias('service.lbConfig'),

  alternates      : null,

  init() {
    this._super(...arguments);

    var alternates = (this.get('lbConfig.certificateIds')||[]).map((id) => {
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
    var def = this.get('lbConfig.defaultCertificateId');
    return this.get('allCertificates').slice().filter((obj) => {
      return Ember.get(obj, 'id') !== def;
    });
  }.property('allCertificates.@each.id','lbConfig.defaultCertificateId'),

  defaultDidChange: function() {
    var def = this.get('lbConfig.defaultCertificateId');
    this.get('alternates').forEach((obj) => {
      if ( Ember.get(obj, 'value') === def )
      {
        Ember.set(obj,'value',null);
      }
    });
  }.observes('lbConfig.defaultCertificateId'),

  alternatesDidChange: function() {
    this.set('lbConfig.certificateIds', this.get('alternates').map((obj) => {
      return Ember.get(obj, 'value');
    }).filter((id) => { return !!id; }).uniq());
  }.observes('alternates.@each.value'),

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },
});
