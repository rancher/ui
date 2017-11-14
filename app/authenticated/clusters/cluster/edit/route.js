import { allSettled } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Route.extend({
  clusterStore: service('cluster-store'),
  settings: service(),
  catalog: service(),

  model() {
    let store = this.get('clusterStore');
    let catalog = this.get('catalog');
    let deps = [];

    let cluster = this.modelFor('authenticated.clusters.cluster').clone();
    if ( cluster.systemStacks === null ) {
      let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};
      cluster.set('systemStacks', (def.systemStacks||[]).map((stack) => {
        stack.type = 'stackConfiguration';
        let extInfo = parseExternalId(stack.externalId);
        deps.push(catalog.fetchTemplate(extInfo.templateId, false));
        return store.createRecord(stack);
      }));
    }

    return allSettled(deps).then(() => {
      return this.get('catalog').fetchTemplates({plusInfra: true}).then((resp) => {
        resp.cluster = cluster;
        return resp;
      });
    });
  },
});
