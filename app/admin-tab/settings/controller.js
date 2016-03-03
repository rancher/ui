import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),

  queryParams: ['backToAdd'],
  backToAdd: false,

  errors: null,
  editing: true,
  saving: false,



  actions: {

    setCatalog: function(value) {
      this.get('model').set('catalog', value);
    },

    save: function() {
      var model = this.get('model');
      var value = this.get('model.host');
      var propsOut = {};

      if (!value) {
        this.set('errors', ['Please provide a DNS name or IP address.']);
        return;
      }

      if (this.get('backToAdd')) {
        propsOut[C.SETTING.API_HOST] = model.host;
      } else {

        Object.keys(model).forEach((item) => {
          switch (item) {
            case 'host':
              propsOut[C.SETTING.API_HOST] = model[item];
              break;
            case 'catalog':
              propsOut[C.SETTING.CATALOG_URL] = model[item];
              break;
            case 'vm':
              propsOut[C.SETTING.VM_ENABLED] = model[item];
              break;
            default:
              break;
          }
        });
      }

      this.set('saving', true);
      // Ember 2.x brings a new setProperties that returns the hash
      // and not the self object so you cant chain calls on setProperties anymore
      this.get('settings').setProperties(propsOut);
      this.get('settings').one('settingsPromisesResolved', () => {

        this.set('saving', false);
        this.set('errors', null);

        if (this.get('backToAdd')) {

          this.transitionToRoute('hosts.new', this.get('projects.current.id'));
        } else {

          this.send('goToPrevious');
        }

      });


    },

    cancel: function() {
      this.send('goToPrevious');
    }
  },

});
