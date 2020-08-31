import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Route.extend({
  globalStore:            service(),
  access:                 service(),
  settings:               service(),
  roleTemplateService:    service('roleTemplate'),
  clusterTemplateService: service('clusterTemplates'),

  _cachedClusterDetails: null,

  beforeModel(transition) {
    let { me: { hasAdmin: globalAdmin = false } } = this.access;

    if (!globalAdmin) {
      const { clusterTemplates } = this.modelFor('clusters.new');
      let { clusterTemplateEnforcement = false }    = this.settings;

      // setting is string value
      if (clusterTemplateEnforcement === 'true') {
        clusterTemplateEnforcement = true;
      } else {
        clusterTemplateEnforcement = false;
      }

      if (clusterTemplateEnforcement) {
        if (clusterTemplates.length === 1 && isEmpty(transition.to.params.clusterTemplateRevision)) {
          return this.replaceWith(this.routeName, transition.to.params.provider, { queryParams: { clusterTemplateRevision: clusterTemplates.firstObject.defaultRevisionId } });
        }
      }
    }

    return;
  },

  model(params) {
    const gs                                    = this.globalStore;
    const {
      kontainerDrivers,
      nodeDrivers,
      clusterTemplates,
      clusterTemplateRevisions
    }                                           = this.modelFor('clusters.new');
    const { provider, clusterTemplateRevision } = params;
    let cluster                                 = gs.createRecord({
      type: 'cluster',
      name: ''
    });
    let ctr                                     = null;
    let ct                                      = null;
    let ctId                                    = null;

    ctr  = clusterTemplateRevisions.findBy('id', clusterTemplateRevision);

    if (clusterTemplateRevision && ctr) {
      ctId = get(ctr, 'clusterTemplateId');
      ct   = clusterTemplates.findBy('id', ctId);

      setProperties(cluster, {
        clusterTemplateRevisionId: clusterTemplateRevision,
        clusterTemplateId:         get(ct, 'id'),
      });

      this.clusterTemplateService.cloneAndPopulateClusterConfig(cluster, ctr);
    } else {
      if (cluster.clusterTemplateId && cluster.clusterTemplateRevisionId && !clusterTemplateRevision) {
        // user deselected RKE Template
        setProperties(cluster, {
          clusterTemplateId:         null,
          clusterTemplateRevisionId: null,
        });
      }
    }

    if (this._cachedClusterDetails) {
      set(cluster, 'name', this._cachedClusterDetails.name);
      set(this, '_cachedClusterDetails', null);
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

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.setProperties({
        clusterTemplateRevision: null,
        importProvider:          null,
        register:                false,
      });
    }
  },

  actions: {
    willTransition(transition) {
      if (transition.queryParamsOnly) {
        let name = this.controller.model.cluster.name ? this.controller.model.cluster.name : null;

        set(this, '_cachedClusterDetails', { name });
      } else {
        if (this._cachedClusterDetails) {
          set(this, '_cachedClusterDetails', null);
        }
      }
    }
  },

  queryParams: {
    clusterTemplateRevision: { refreshModel: true },
    importProvider:          { refreshModel: true },
  }
});
