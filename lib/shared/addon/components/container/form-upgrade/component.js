import Ember from 'ember';

export default Ember.Component.extend({
  service: null,
  editing: null,
  isUpgrade: null,

  classNames: ['accordion-wrapper'],
  interval: null,

  intervalChanged: function() {
    this.set('service.intervalMillis', Math.floor(this.get('interval')*1000));
  }.observes('interval'),

  didReceiveAttrs() {
    let ms = this.get('service.intervalMillis')||0;
    this.set('interval', ms/1000);

    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
          item.toggleProperty('expanded');
      });
    }
  },
});
