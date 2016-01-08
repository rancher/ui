import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      var modelOut;

      Ember.$.getJSON(`${C.EXT_REFERENCES.FORUM}/categories.json`).then((response) => {
        modelOut = {
          resolved: true,
        };

        response.category_list.categories.forEach((item) => {

          switch (item.name) {
            case 'Announcements':
              modelOut.annoucements = item;
              break;
            case 'General':
              modelOut.general = item;
              break;
            case 'Rancher':
              modelOut.rancher = item;
              break;
            case 'RancherOS':
              modelOut.rancherOS = item;
              break;
            case 'Convoy':
              modelOut.convoy = item;
              break;
            default:
              break;
          }
        });

        this.controller.set('model', modelOut);

      }, (/*error*/) => {

        modelOut = {
          resolved: true,
          error: true
        };

        this.controller.set('model', modelOut);
      });

      return true; //bubble the transition event
    },
  },
  beforeModel: function() {
    var store = this.get('store');

    return Ember.RSVP.all([

      store.findAllUnremoved('service'),
      store.findAllUnremoved('host'),

    ]).then((results) => {

      if (results[0].content.length === 0 || results[1].content.length === 0) {

        this.controllerFor('authenticated.help').set('hasServices', false);

      }
    });
  },
});
