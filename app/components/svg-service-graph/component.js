import Ember from 'ember';

export default Ember.Component.extend({
  services: null,

  tagName: 'svg',
  attributeBindings: ['width','height','xmlns','viewBox'],

  width:"100%",
  height:"100%",
  xmlns:"http://www.w3.org/2000/svg",
  viewBox: '0 0 1000 1000',

  actions: {
    openInfo: function(service) {
      this.sendAction('action', service);
    },
  },

  nodes: Ember.computed('services.[]', function() {
    return this.get('services').map((service, index) => {
      return {
        x: 100 + 300*(index%3),
        y: 200*Math.floor(index/3),
        path: {
          m: [100, 150],
          l: [[150,150], [150, 200], [300,300]]
        },
        service: service
      };
    });
  }),

  paths: Ember.computed('services.[]', function() {
    return this.get('services').map(() => {
      return {
        m: [100, 150],
        l: [[150,150], [150, 200], [300,300]]
      };
    });
  }),
});
