import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  globalStore:  service(),
  access:       service(),
  growl:        service(),
  scope:        service(),
  settings:     service(),
  modalService: service('modal'),

  layout,
  classNames: ['modal-container', 'large-modal', 'alert'],
  kubeconfig: null,

  step: 1,

  downloadUrl: 'http://kubernetes.io/docs/user-guide/prereqs/',

  didReceiveAttrs() {
    get(this, 'scope.currentCluster').doAction('generateKubeconfig')
      .then((obj) => {
        set(this, 'kubeconfig', get(obj, 'config'));
        set(this, 'step', 2);
      })
      .catch((err) => {
        this.get('growl').fromError('Error creating kubeconfig file', err);
        this.get('modalService').toggleModal();
      });
  },

  didInsertElement() {
    this._super();
    next(this, () => {
      var btn = $('.close-kubeconfig')[0]; // eslint-disable-line

      if ( btn ) {
        btn.focus();
      }
    });
  },
});
