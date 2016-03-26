import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';
const { getOwner } = Ember;

export default Ember.Route.extend({
  access: Ember.inject.service(),
  settings: Ember.inject.service(),

  backTo: null,
  model(params) {
    this.set('backTo', params.backTo);

    let store = this.get('store');
    if ( this.get('access.admin') && store.hasRecordFor('schema','setting') ) {
      return store.find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
        let controller = this.controllerFor('hosts.new');
        if ( setting.get('value') ) {
          controller.set('apiHostSet', true);
        } else {
          let settings = this.get('settings');
          controller.setProperties({
            apiHostSet: false,
            hostModel: settings.get(C.SETTING.API_HOST)
          });
        }
        return Ember.RSVP.resolve();
      });
    }
  },

  activate() {
    let appRoute = getOwner(this).lookup('route:application');
    this.set('previousOpts', {name: appRoute.get('previousRoute'), params: appRoute.get('previousParams')});
  },

  deactivate() {
    this.set('lastRoute', this.get('something'));
  },

  actions: {
    cancel() {
      this.send('goBack');
    },

    savedHost() {
      this.controllerFor('hosts.new').set('apiHostSet', true);
      this.refresh();
    },

    goBack() {
      if ( this.get('backTo') === 'k8s' ) {
        this.transitionTo('k8s-tab.waiting');
      } else if ( this.get('backTo') === 'swarm' ) {
        this.transitionTo('applications-tab.compose-waiting');
      } else {
        let appRoute = getOwner(this).lookup('route:application');
        let opts = this.get('previousOpts');
        appRoute.set('previousRoute', opts.name);
        appRoute.set('previousParams', opts.params);
        this.send('goToPrevious','hosts');
      }
    }
  },
});
