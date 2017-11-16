import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';


export default Route.extend({
  clusterStore: service('cluster-store'),
  model(params, transistion) {
    return this.get('store').find('hosttemplate', params.template_id).then((template) => {
      return this.get('userStore').find('machinedriver', null, {forceReload: true}).then((drivers) => {
        var driver = drivers.findBy('name', template.driver);
        var configId = `${template.driver}Config`;
        var config = this.get('store').createRecord(template.publicValues[configId]);
        var tmp = {
          type: 'host',
          hostTemplateId: template.id
        };
        return this.get('clusterStore').find('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true}).then((clusters) => {
          let clusterToCreateOn = get(transistion, 'params')['authenticated.clusters.cluster']['cluster_id'];
          return {
            template: template,
            config: config,
            host: this.get('store').createRecord(tmp),
            driver: driver,
            clusters: clusters,
            clusterId: clusterToCreateOn
          }
        });
      });
    });
  },
  actions: {
    cancel() {
      this.send('goBack');
    },

    goBack() {
      this.goToPrevious();
    }
  },
});
