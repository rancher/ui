import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  backTo: null,
  model: function(params) {
    this.set('backTo', params.backTo);

    var store = this.get('store');
    if ( this.get('access.admin') && store.hasRecordFor('schema','setting') )
    {
      return store.find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
        if ( setting.get('value') )
        {
          return Ember.RSVP.resolve();
        }
        else
        {
          this.transitionTo('admin-tab.settings', {queryParams: {backToAdd: true}});
        }
      });
    }
  },

  actions: {
    cancel() {
      this.send('goBack');
    },

    goBack() {
      if ( this.get('backTo') === 'k8s' )
      {
        this.transitionTo('k8s-tab.waiting');
      }
      else
      {
        this.transitionTo('hosts');
      }
    }
  },
});
