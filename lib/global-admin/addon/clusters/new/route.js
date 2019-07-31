import Route from '@ember/routing/route';
// import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash, hashSettled } from 'rsvp';
import { loadScript, loadStylesheet, proxifyUrl } from 'shared/utils/load-script';
import { get, set } from '@ember/object';

export default Route.extend({
  globalStore:         service(),

  model() {
    const gs = this.globalStore;

    const reqs = {
      kontainerDrivers:         gs.findAll('kontainerdriver'),
      nodeDrivers:              gs.findAll('nodeDriver'),
    };

    if ( gs.getById('schema', 'clustertemplaterevision') ) {
      reqs.clusterTemplates = gs.findAll('clustertemplate');
      reqs.clusterTemplateRevisions = gs.findAll('clustertemplaterevision');
    } else {
      reqs.clusterTemplates = [];
      reqs.clusterTemplateRevisions = [];
    }

    return hash(reqs);
  },

  afterModel(model) {
    // load the css/js url here, if the url loads fail we should error the driver out
    // show the driver in the ui, greyed out, and possibly add error text "can not load comonent from url [put url here]"
    let { kontainerDrivers } = model;
    let externalDrivers      = kontainerDrivers.filter( (d) => d.uiUrl !== '' && d.state === 'active');
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

    if (Object.keys(promises).length > 0) {
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
    } else {
      return model;
    }
  }
});
