import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  model() {
    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};
    def.type = 'cluster';

    return Ember.Object.create({
      cluster: this.get('userStore').createRecord(def),
      createProject: this.get('userStore').createRecord({
        type: 'project',
        name: 'Default',
      }),
    });
  },
});
