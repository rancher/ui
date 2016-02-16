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
    this.get('store').findAllUnremoved('host').then((hosts) => {
      this.controller.set('hasHosts', hosts.get('length') > 0);
    });
  },
});
