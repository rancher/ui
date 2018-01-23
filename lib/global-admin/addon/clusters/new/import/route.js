import Route from '@ember/routing/route'
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service'

export default Route.extend({
  globalStore: service(),

  model() {
    let models = this.modelFor('clusters.new');
    let cluster = get(models,'cluster');
    let config = get(this,'globalStore').createRecord({
      type: 'importedConfig',
      kubeConfig: '',
    });

    set(cluster, 'importedConfig', config);

    return models;
  }
});
