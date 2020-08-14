import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash, hashSettled/* , all */ } from 'rsvp';
import { loadScript, loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import { isEmpty } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';

export default Route.extend({
  access:                 service(),
  globalStore:            service(),
  releaseVersions:        service(),
  clusterTemplateService: service('clusterTemplates'),
  roleTemplateService:    service('roleTemplate'),

  model() {
    const globalStore = this.get('globalStore');
    const cluster     = this.modelFor('authenticated.cluster');

    let modelOut      = {
      originalCluster:            cluster,
      cluster:                    cluster.clone(),
      cloudCredentials:           globalStore.findAll('cloudcredential'),
      kontainerDrivers:           globalStore.findAll('kontainerDriver'),
      nodeTemplates:              globalStore.findAll('nodeTemplate'),
      nodeDrivers:                globalStore.findAll('nodeDriver'),
      psps:                       globalStore.findAll('podSecurityPolicyTemplate'),
      roleTemplates:              get(this, 'roleTemplateService').get('allFilteredRoleTemplates'),
      users:                      globalStore.findAll('user'),
      clusterRoleTemplateBinding: globalStore.findAll('clusterRoleTemplateBinding'),
      me:                         get(this, 'access.principal'),
    };

    if (cluster.driver === 'k3s' || cluster.driver === 'rke2') {
      this.releaseVersions.getAllVersions(cluster.driver);
    }

    if (!isEmpty(cluster.clusterTemplateRevisionId)) {
      setProperties(modelOut, {
        clusterTemplateRevisions: globalStore.findAll('clustertemplaterevision'),
        clusterTemplates:         globalStore.findAll('clustertemplate'),
      });
    }

    return hash(modelOut);
  },

  afterModel(model, transition) {
    let {
      clusterTemplateRevisions = null,
      cluster
    } = model;
    let { clusterTemplateRevisionId } = cluster;

    if (clusterTemplateRevisionId) {
      if (clusterTemplateRevisions) {
        let ctr               = null;
        const { queryParams } = transition.to;

        if (queryParams && queryParams.clusterTemplateRevision) {
          clusterTemplateRevisionId = queryParams.clusterTemplateRevision;

          set(cluster, 'clusterTemplateRevisionId', clusterTemplateRevisionId);
        }

        ctr  = clusterTemplateRevisions.findBy('id', clusterTemplateRevisionId);

        if (ctr) {
          set(model, 'clusterTemplateRevision', ctr);

          // This is breaking fields that already have values that don't match the template, like kubernetesVersion with 1.14.x
          // this.clusterTemplateService.cloneAndPopulateClusterConfig(cluster, ctr);
        } else {
          // user does not have access to the template that was used to launch a cluster
          // create a fake cluster that we'll use to turn into a "temaplate Revision" to be passed down to components
          // I am using JSON flow here to drop any of the dynamic UI only fields so we dont risk cross contamination with observables and the like.
          let tempCluster  = JSON.parse(JSON.stringify(cluster.cloneForNew()));

          set(tempCluster, 'type', 'clusterSpec');

          let tempSpec     = this.globalStore.createRecord(tempCluster);

          // a template revision has a "cluster config" that should be set which we'll fake with a parsed spec
          setProperties(tempCluster, {
            type:          'clusterTemplateRevision',
            clusterConfig: JSON.parse(JSON.stringify(tempSpec)),
          });

          let tempRevision = this.globalStore.createRecord(tempCluster);

          set(model, 'clusterTemplateRevision', tempRevision);
        }
      }
    }

    // load the css/js url here, if the url loads fail we should error the driver out
    // show the driver in the ui, greyed out, and possibly add error text "can not load comonent from url [put url here]"
    let { kontainerDrivers } = model;
    let externalDrivers      = kontainerDrivers.filter( (d) => d.uiUrl !== '' && d.state === 'active' && d.name.includes(model.cluster.clusterProvider));
    let promises             = {};

    externalDrivers.forEach( (d) => {
      if (get(d, 'hasUi')) {
        const jsUrl  = proxifyUrl(d.uiUrl, this.get('app.proxyEndpoint'));
        const cssUrl = proxifyUrl(d.uiUrl.replace(/\.js$/, '.css'), get(this, 'app.proxyEndpoint'));

        // skip setProperties cause of weird names
        set(promises, `${ d.name }Js`, loadScript(jsUrl, `driver-ui-js-${ d.name }`));
        set(promises, `${ d.name }Css`, loadStylesheet(cssUrl, `driver-ui-css-${ d.name }`));
      }
    });

    if (isEmpty(promises)) {
      return model;
    } else {
      return hashSettled(promises).then( (settled) => {
        let allkeys = Object.keys(settled);

        allkeys.forEach( (key) => {
          if (get(settled, `${ key }.state`) === 'rejected') {
            let tmp = key.indexOf('Js') > -1 ? key.replace(/\Js$/, '') : key.replace(/\Css$/, '');
            let match = kontainerDrivers.findBy('id', tmp);

            console.log('Error Loading External Component for: ', match);
            if (match && get(match, 'scriptError') !== true) {
              set(match, 'scriptError', get(this, 'intl').t('clusterNew.externalError'));
            }
          }
        });
      }).finally(() => {
        return model;
      });
    }
  },

  setupController(controller/* , model*/) {
    this._super(...arguments);
    set(controller, 'step', 1);
  },

  resetController(controller, isExiting /* , transition*/ ) {
    if (isExiting) {
      controller.set('errors', null);
      controller.set('provider', null);
    }
  },

  activate() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, function() {
      set(this, 'controller.model.activated', true);
    });
  },

  actions: {
    willTransition() {
      set(this, 'controller.scrollTo', null);
    }
  },

  queryParams: {
    provider:                { refreshModel: true },
    clusterTemplateRevision: { refreshModel: true }
  },
});
