import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash, hashSettled/* , all */ } from 'rsvp';
import { loadScript, loadStylesheet, proxifyUrl } from 'shared/utils/load-script';

export default Route.extend({
  access:              service(),
  catalog:             service(),
  settings:            service(),
  globalStore:         service(),
  intl:                service(),
  roleTemplateService: service('roleTemplate'),

  mustAbortBecauseImAnExternalRoute: false,

  init() {
    this._super(...arguments);

    const allowed = [
      'import',
      'custom',
      'googlegke',
      'amazoneks',
      'azureaks',
    ];
    const parsedQp = get(this, 'router._routerMicrolib.activeTransition.queryParams.provider');

    if (!allowed.includes(parsedQp)) {
      // we can't use transitionTo here as it does not seem to abort the current transition
      set(this, 'mustAbortBecauseImAnExternalRoute', true);
    }
  },


  beforeModel() {
    if (get(this, 'mustAbortBecauseImAnExternalRoute')) {
      set(this, 'mustAbortBecauseImAnExternalRoute', false);
      this.transitionTo({ queryParams: { provider: 'googlegke' } } );
    }
  },

  model(params) {
    let gs = get(this, 'globalStore');

    let cluster = gs.createRecord({ type: 'cluster' });

    if (get(params, 'provider')) {
      set(this, 'provider', get(params, 'provider'));
    }

    return hash({
      cluster,
      clusterRoleTemplateBinding: gs.findAll('clusterRoleTemplateBinding'),
      cloudCredentials:           gs.findAll('cloudcredential'),
      kontainerDrivers:           gs.findAll('kontainerDriver'),
      me:                         get(this, 'access.principal'),
      nodeDrivers:                gs.findAll('nodeDriver'),
      nodeTemplates:              gs.findAll('nodeTemplate'),
      psps:                       gs.findAll('podSecurityPolicyTemplate'),
      roleTemplates:              get(this, 'roleTemplateService').fetchFilteredRoleTemplates(),
      users:                      gs.findAll('user'),
    });
  },

  afterModel(model) {
    // load the css/js url here, if the url loads fail we should error the driver out
    // show the driver in the ui, greyed out, and possibly add error text "can not load comonent from url [put url here]"

    let { kontainerDrivers } = model;
    let externalDrivers      = kontainerDrivers.filter( (d) => d.uiUrl !== '');
    let promises = {};

    externalDrivers.forEach( (d) => {
      if (get(d, 'hasUi')) {
        const jsUrl  = proxifyUrl(d.uiUrl, this.get('app.proxyEndpoint'));
        const cssUrl = proxifyUrl(d.uiUrl.replace(/\.js$/, '.css'), get(this, 'app.proxyEndpoint'));

        // skip setProperties cause of weird names
        set(promises, `${ d.name }Js`, loadScript(jsUrl, `driver-ui-js-${ d.name }`));
        set(promises, `${ d.name }Css`, loadStylesheet(cssUrl, `driver-ui-css-${ d.name }`));
      }
    });

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
  },

  setupController(controller/* , model */) {
    this._super(...arguments);

    set(controller, 'step', 1);
  },

  queryParams: { provider: { refreshModel: true } },

});
