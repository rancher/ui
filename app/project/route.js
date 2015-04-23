import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params /*, transition*/) {
    return this.get('store').find('project', params.project_id);
  },

  actions: {
    didTransition: function() {
      this._super();
      this.send('setPageLayout', {label: 'All Projects', backRoute: 'projects'});
    },
  }
});
