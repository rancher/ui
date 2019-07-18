import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, setProperties, set } from '@ember/object';

export default Route.extend({
  globalStore:         service(),
  access:              service(),
  roleTemplateService: service('roleTemplate'),

  model(params) {
    const gs                                         = this.globalStore;
    const {
      cluster,
      kontainerDrivers,
      nodeDrivers,
      clusterTemplates,
      clusterTemplateRevisions
    } = this.modelFor('clusters.new');
    const { provider, clusterTemplateRevision }      = params;
    let ctr  = null;
    let ct   = null;
    let ctId = null;

    if (clusterTemplateRevision) {
      ctr  = clusterTemplateRevisions.findBy('id', clusterTemplateRevision);
      ctId = get(ctr, 'clusterTemplateId');
      ct   = clusterTemplates.findBy('id', ctId);

      setProperties(cluster, {
        clusterTemplateRevisionId: clusterTemplateRevision,
        clusterTemplateId:         get(ct, 'id'),
      });

      this.populateConfigFromClusterTemplate(cluster, ctr);
    }

    return hash({
      cluster,
      kontainerDrivers,
      nodeDrivers,
      provider,
      clusterTemplateRevision:    ctr,
      roleTemplates:              get(this, 'roleTemplateService').fetchFilteredRoleTemplates(),
      me:                         get(this, 'access.principal'),
      cloudCredentials:           gs.findAll('cloudcredential'),
      clusterRoleTemplateBinding: gs.findAll('clusterRoleTemplateBinding'),
      nodeTemplates:              gs.findAll('nodeTemplate'),
      psps:                       gs.findAll('podSecurityPolicyTemplate'),
      users:                      gs.findAll('user'),
      clusterTemplates,
      clusterTemplateRevisions
    });
  },

  populateConfigFromClusterTemplate(cluster, clusterTemplateRevision) {
    let clusterConfig = clusterTemplateRevision.clusterConfig.cloneForNew();

    set(clusterConfig, 'type', 'cluster');

    setProperties(cluster, clusterConfig);
  },

  queryParams: { clusterTemplateRevision: { refreshModel: true } }
});
