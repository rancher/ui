import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

const CONFIG_TPL = `apiVersion: v1
kind: Config
clusters:
- name: "%clusterName%"
  cluster:
    server: "%baseUrl%/k8s/clusters/%clusterId%"
    api-version: v1%maybeCertificate%

users:
- name: "%username%"
  user:
    token: "%token%"

contexts:
- name: "%clusterName%"
  context:
    user: "%username%"
    cluster: "%clusterName%"

current-context: "%clusterName%"
`;



export default Component.extend(ModalBase, {
  layout,
  classNames: ['modal-container', 'large-modal', 'alert'],
  globalStore: service(),
  access: service(),
  growl: service(),
  scope: service(),
  settings: service(),
  modalService: service('modal'),

  token: null,

  step: 1,

  downloadUrl: 'http://kubernetes.io/docs/user-guide/prereqs/',

  replaceVariables(str) {
    let base = window.location.origin;
    if ( base.indexOf('http://') === 0 ) {
      base = base.replace(/^http:\/\//,'https://');
      if ( ! window.location.port ) {
        base += ':80';
      }
    }

    const me = get(this, 'access.me');
    const cluster = get(this, 'scope.currentCluster');
    const tokenObj = get(this, 'token');

    let cert = get(this, `settings.${C.SETTING.CA_CERTS}`);
    let wrapped;
    if ( cert && cert.length ) {
      let ary = [];
      cert = btoa(cert);
      let split = 45;
      while ( cert.length ) {
        ary.push(cert.substr(0,split))
        cert = cert.substr(split);
        split=72;
      }
      wrapped = ary.join('\\\n      ').trim();
    }

    let token = '';
    if ( tokenObj ) {
      token = tokenObj.token;
    }

    return str
      .replace(/%baseUrl%/g,     base)
      .replace(/%clusterId%/g,   get(cluster, 'id'))
      .replace(/%clusterName%/g, get(cluster, 'displayName'))
      .replace(/%maybeCertificate%/g, (wrapped ? '\n    certificate-authority-data: "' + wrapped + '"': ''))
      .replace(/%username%/g,    get(me, 'username'))
      .replace(/%token%/g,       token);
  },

  didReceiveAttrs() {
    const body = {
      description: this.replaceVariables('kubectl token for %clusterName% cluster'),
      responseType: 'json',
      ttl: 365*24*60*60*1000
    };

    return this.get('globalStore').request({
      url: 'tokens',
      method: 'POST',
      data: body,
    }).then((token) => {
      if ( typeof token === 'string' ) {
        token = JSON.parse(token);
      }

      set(this, 'token', token);
      set(this, 'step', 2);
    }).catch((err) => {
      this.get('growl').fromError('Error creating API Key',err);
      this.get('modalService').toggleModal();
    });
  },

  kubeconfig: computed('token', function() {
    return this.replaceVariables(CONFIG_TPL);
  }),
});
