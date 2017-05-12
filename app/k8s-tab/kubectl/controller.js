import Ember from 'ember';
import C from 'ui/utils/constants';

const OLD_CONFIG_TPL = `apiVersion: v1
kind: Config
clusters:
- cluster:
    api-version: v1%maybeInsecure%
    server: "%baseUrl%/r/projects/%projectId%/kubernetes"
  name: "%projectName%"
contexts:
- context:
    cluster: "%projectName%"
    user: "%projectName%"
  name: "%projectName%"
current-context: "%projectName%"
users:
- name: "%projectName%"
  user:
    username: "%publicValue%"
    password: "%secretValue%"`;

const NEW_CONFIG_TPL = `apiVersion: v1
kind: Config
clusters:
- cluster:
    api-version: v1%maybeInsecure%
    server: "%baseUrl%/r/projects/%projectId%/kubernetes:6443"
  name: "%projectName%"
contexts:
- context:
    cluster: "%projectName%"
    user: "%projectName%"
  name: "%projectName%"
current-context: "%projectName%"
users:
- name: "%projectName%"
  user:
    token: "%token%"`;


export default Ember.Controller.extend({
  access: Ember.inject.service(),
  growl: Ember.inject.service(),
  k8s: Ember.inject.service(),
  projects: Ember.inject.service(),

  step: 1,
  kubeconfig: '',

  downloadUrl: 'http://kubernetes.io/docs/user-guide/prereqs/',

  actions: {
    generate() {
      let supportsAuth = this.get('k8s.supportsAuth');
      this.set('step', 2);

      var name = this.get('access.identity.name');
      if ( name ) {
        name = 'kubectl: ' + name;
      } else {
        name = 'kubectl';
      }

      let storeName, tpl, accountId;
      if ( supportsAuth ) {
        tpl = NEW_CONFIG_TPL;
        storeName = 'userStore';
        accountId = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
      } else {
        tpl = OLD_CONFIG_TPL;
        storeName = 'store';
        accountId = this.get('projects.current.id');
      }

      this.get(storeName).createRecord({
        type: 'apiKey',
        accountId: accountId,
        name: name,
        description: 'Provides workstation access to kubectl'
      }).save().then((key) => {
        var base = window.location.origin;
        var insecure = false;
        if ( base.indexOf('http://') === 0 )
        {
          base = base.replace(/^http:\/\//,'https://');
          insecure = true;
        }

        let token = btoa('Basic ' + btoa(key.get('publicValue') + ':' + key.get('secretValue')));

        var config = tpl
          .replace(/%baseUrl%/g,     base)
          .replace(/%maybeInsecure%/g,(insecure ? '\n    insecure-skip-tls-verify: true' : ''))
          .replace(/%projectName%/g, this.get('projects.current.displayName'))
          .replace(/%projectId%/g,   this.get('projects.current.id'))
          .replace(/%publicValue%/g, key.get('publicValue'))
          .replace(/%secretValue%/g, key.get('secretValue'))
          .replace(/%token%/g, token);

        this.set('kubeconfig', config);
        this.set('step',3);
      }).catch((err) => {
        this.set('step',1);
        this.get('growl').fromError('Error creating API Key',err);
      });
    },
  },
});
