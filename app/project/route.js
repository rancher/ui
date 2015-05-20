import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params /*, transition*/) {
    return this.get('store').find('project', params.project_id);
  },
});
