import Component from '@ember/component';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import CrudCatalog from 'shared/mixins/crud-catalog';

const HARBOR_ADMIN_PASSWORD = 'harborAdminPassword';
const EXTERNAL_URL = 'externalURL';
const INGRESS_HOSTS_CORE = 'expose.ingress.host';
const DEFAULT_ADMIN_PASSWORD = 'Harbor12345';
const APP_VERSION = 'catalog://?catalog=system-library&template=harbor&version=0.3.0';

export default Component.extend(CrudCatalog, {
  layout,

  answers:    null,
  appName:    'global-registry',
  nsName:     'global-registry',
  appVersion: APP_VERSION,

  init() {
    this._super(...arguments);

    const customAnswers = {};

    if ( get(this, 'enabled') ) {
      const answers = get(this, 'app.answers') || {};

      Object.keys(answers).forEach((key) => {
        switch (key) {
        case HARBOR_ADMIN_PASSWORD:
          set(this, 'password', answers[key]);
          break;
        default:
          customAnswers[key] = answers[key];
        }
      });
    } else {
      customAnswers[EXTERNAL_URL] = `https://${ window.location.host }`;
      customAnswers[INGRESS_HOSTS_CORE] = window.location.host;
      set(this, 'password', DEFAULT_ADMIN_PASSWORD);
      const config = {}

      setProperties(config, {
        persistenceEnabled:          false,
        persistenceStorageclassSize: '5Gi',
        clairEnabled:                true,
        notaryEnabled:               true,
        chartmuseumEnabled:          true,
      })

      set(this, 'config', config)
    }
    set(this, 'customAnswers', customAnswers);
  },

  actions: {
    save(cb) {
      const answers = {};

      answers[HARBOR_ADMIN_PASSWORD] = get(this, 'password');
      this.save(cb, answers);
    }
  },

  dockerLogin: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || {})[INGRESS_HOSTS_CORE];

    return `docker login --username=admin ${ url }`;
  }),

  dockerPull: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || {})[INGRESS_HOSTS_CORE];

    return `docker pull ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),

  dockerTag: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || {})[INGRESS_HOSTS_CORE];

    return `docker tag SOURCE_IMAGE[:TAG] ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),

  dockerPush: computed('app.answers', function() {
    const url = (get(this, 'app.answers') || {})[INGRESS_HOSTS_CORE];

    return `docker push ${ url }/REPO_NAME/IMAGE_NAME[:TAG]`;
  }),
});
