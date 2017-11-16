import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

const CONFIG_TPL = `apiVersion: v1
kind: Config
clusters:
- cluster:
    api-version: v1%maybeInsecure%
    server: "%baseUrl%/k8s/clusters/%clusterId%"
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



export default Component.extend(ModalBase, {
  layout,
  classNames: ['modal-container', 'large-modal', 'alert'],
  access: service(),
  growl: service(),
  scope: service(),

  step: 1,
  kubeconfig: '',

  downloadUrl: 'http://kubernetes.io/docs/user-guide/prereqs/',

  didReceiveAttrs() {
    var name = this.get('access.identity.name');
    if ( name ) {
      name = 'kubectl: ' + name;
    } else {
      name = 'kubectl';
    }

    this.get('store').createRecord({
      type: 'apiKey',
      name: name,
      description: 'Provides workstation access to kubectl'
    }).save().then((key) => {
      var base = window.location.origin;
      var insecure = false;
      if ( base.indexOf('http://') === 0 )
      {
        base = base.replace(/^http:\/\//,'https://');
        if ( !window.location.port ) {
          base += ':80';
        }
        insecure = true;
      }

      var config = CONFIG_TPL
        .replace(/%baseUrl%/g,     base)
        .replace(/%maybeInsecure%/g,(insecure ? '\n    insecure-skip-tls-verify: true' : ''))
        .replace(/%projectName%/g, this.get('scope.current.displayName'))
        .replace(/%projectId%/g,   this.get('scope.current.id'))
        .replace(/%clusterId%/g,   this.get('scope.currentCluster.id'))
        .replace(/%publicValue%/g, key.get('publicValue'))
        .replace(/%secretValue%/g, key.get('secretValue'));

      this.set('kubeconfig', config);
      this.set('step',2);
    }).catch((err) => {
      this.set('step',1);
      this.get('growl').fromError('Error creating API Key',err);
    });
  },
});
