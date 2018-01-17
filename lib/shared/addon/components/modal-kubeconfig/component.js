import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

const CONFIG_TPL = `apiVersion: v1
kind: Config
clusters:
- name: "%clusterName%"
  cluster:
    api-version: v1
    server: "%baseUrl%/k8s/clusters/%clusterId%"

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
  modalService: service('modal'),

  token: null,

  step: 1,

  downloadUrl: 'http://kubernetes.io/docs/user-guide/prereqs/',

  replaceVariables(str) {
    const base = window.location.origin;
    const me = get(this, 'access.me');
    const cluster = get(this, 'scope.currentCluster');
    const token = get(this, 'token');

    return str
      .replace(/%baseUrl%/g,     base)
      .replace(/%clusterId%/g,   get(cluster, 'id'))
      .replace(/%clusterName%/g, get(cluster, 'displayName'))
      .replace(/%username%/g,    get(me, 'username'))
      .replace(/%token%/g,       token);
  },

  didReceiveAttrs() {
    const body = {
      description: this.replaceVariables('kubectl token for %clusterName% cluster'),
      responseType: 'json',
      ttl: 365*24*60*60*1000
    };

    return this.get('globalStore').rawRequest({
      url: 'tokens',
      method: 'POST',
      data: body,
    }).then((token) => {
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
