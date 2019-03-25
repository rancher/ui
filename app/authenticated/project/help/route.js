import { hash } from 'rsvp';
import $ from 'jquery';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  beforeModel() {
    this.get('store').findAll('host')
      .then((hosts) => {
        this.controllerFor('authenticated.project.help').set('hasHosts', hosts.get('length') > 0);
      });
  },

  resetController(controller, isExisting/* , transition*/) {
    if (isExisting) {
      controller.set('modelResolved', false);
      controller.set('modelError', false);
    }
  },
  actions: {
    didTransition() {
      $.getJSON(`${ C.EXT_REFERENCES.FORUM }/categories.json`).then((response) => {
        let modelOut = { resolved: true, };

        let promises = {};

        response.category_list.categories.forEach((item) => {
          switch (item.name) {
          case 'Announcements':
            modelOut.announcements = item;
            promises['announcements'] = $.getJSON(`${ C.EXT_REFERENCES.FORUM }/c/${ item.id }/l/latest.json`);
            break;
          case 'General':
            modelOut.general = item;
            promises['general'] = $.getJSON(`${ C.EXT_REFERENCES.FORUM }/c/${ item.id }/l/latest.json`);
            break;
          case 'Rancher':
            modelOut.rancher = item;
            promises['rancher'] = $.getJSON(`${ C.EXT_REFERENCES.FORUM }/c/${ item.id }/l/latest.json`);
            break;
          case 'RancherOS':
            modelOut.rancherOS = item;
            promises['rancherOS'] = $.getJSON(`${ C.EXT_REFERENCES.FORUM }/c/${ item.id }/l/latest.json`);
            break;
          default:
            break;
          }
        });

        hash(promises).then((hash) => {
          Object.keys(hash).forEach((key) => {
            let topics = hash[key].topic_list.topics.filterBy('pinned', false);

            topics.length = 5;
            modelOut[key].topics = topics;
          });

          this.controller.set('model', modelOut);
        })
          .catch(fail);
      }, fail);

      return true; // bubble the transition event

      function fail(/* error*/) {
        let modelOut = {
          resolved: true,
          error:    true
        };

        this.controller.set('model', modelOut);
      }
    },
  },

});
