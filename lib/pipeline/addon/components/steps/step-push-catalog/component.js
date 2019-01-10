import Component from '@ember/component';
import layout from './template';
import { set, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = { gitBranch: 'master' };
const HTTP = 'http://';
const HTTPS = 'https://';
const HTTP_MODE = 'http';
const SSH_MODE = 'ssh';
const USERNAME = 'USERNAME';
const PASSWORD = 'PASSWORD';
const DEPLOY_KEY = 'DEPLOY_KEY';

export default Component.extend(Step, {
  scope: service(),
  layout,

  config:        null,
  field:         'publishCatalogConfig',
  defaultConfig: DEFAULT_CONFIG,

  init() {
    this._super(...arguments);

    this.initMode();
    this.initSecret();
  },

  initMode() {
    const url = get(this, 'config.publishCatalogConfig.gitUrl');

    if ( !url || url.startsWith(HTTP) || url.startsWith(HTTPS) ) {
      set(this, 'mode', HTTP_MODE);
    } else {
      set(this, 'mode', SSH_MODE);
    }
  },

  initSecret() {
    const projectId = get(this, 'scope.currentProject.id').split(':')[1];

    set(this, 'namespace', { id: `${ projectId }-pipeline` });
    const envFrom = get(this, 'config.envFrom') ;

    if ( envFrom ) {
      if ( get(this, 'mode') === HTTP_MODE ) {
        this.setSecret(USERNAME);
        if ( !get(this, 'secret') ) {
          this.setSecret(PASSWORD);
        }
      } else {
        this.setSecret(DEPLOY_KEY);
      }
    }
  },

  setSecret(key) {
    const envFrom = get(this, 'config.envFrom') ;
    let secret = envFrom.findBy('targetkey', key);

    if ( !secret ) {
      secret = envFrom.filter((k) => !get(k, 'targetkey')).findBy('sourceKey', key);
    }

    if ( secret ) {
      set(this, 'secret', get(secret, 'sourceName'));
    }
  },

  willSave() {
    const envFrom = [];

    if ( get(this, 'mode') === HTTP_MODE ) {
      envFrom.push({
        sourceName: get(this, 'secret'),
        sourceKey:  USERNAME,
        targetkey:  USERNAME
      });
      envFrom.push({
        sourceName: get(this, 'secret'),
        sourceKey:  PASSWORD,
        targetkey:  PASSWORD
      });
    } else {
      envFrom.push({
        sourceName: get(this, 'secret'),
        sourceKey:  DEPLOY_KEY,
        targetkey:  DEPLOY_KEY
      });
    }
    set(this, 'config.envFrom', envFrom);
  },

  validate() {
    const intl = get(this, 'intl');
    const errors = [];

    this.validateField('path', errors);
    this.validateField('catalogTemplate', errors);
    this.validateField('version', errors);
    this.validateField('gitUrl', errors);
    this.validateField('gitBranch', errors);
    this.validateField('gitAuthor', errors);
    this.validateField('gitEmail', errors);

    const url = get(this, 'config.publishCatalogConfig.gitUrl');

    if ( get(this, 'mode') === HTTP_MODE && url && !url.startsWith(HTTP) && !url.startsWith(HTTPS) ){
      errors.push(intl.t(`newPipelineStep.stepType.publishCatalog.gitUrl.error`, { key: USERNAME }));
    }

    if ( get(this, 'secret') ) {
      if ( get(this, 'mode') === HTTP_MODE ) {
        if ( !get(this, `selectedSecret.data.${ USERNAME }`) ) {
          errors.push(intl.t(`newPipelineStep.stepType.publishCatalog.secret.missingKey`, { key: USERNAME }));
        }
        if ( !get(this, `selectedSecret.data.${ PASSWORD }`) ) {
          errors.push(intl.t(`newPipelineStep.stepType.publishCatalog.secret.missingKey`, { key: PASSWORD }));
        }
      } else {
        if ( !get(this, `selectedSecret.data.${ DEPLOY_KEY }`) ) {
          errors.push(intl.t(`newPipelineStep.stepType.publishCatalog.secret.missingKey`, { key: DEPLOY_KEY }));
        }
      }
    } else {
      errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.secret.label`) }));
    }

    return errors;
  },

  validateField(key, errors) {
    const intl = get(this, 'intl');
    const config = get(this, 'config.publishCatalogConfig');

    if ( !get(config, key) || get(config, key).trim() === '' ) {
      errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.${ key }.label`) }));
    }
  }
});
