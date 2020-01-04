import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import { all as PromiseAll } from 'rsvp';
import $ from 'jquery';

export default Component.extend(ModalBase, {
  settings:       service(),
  intl:           service(),
  scope:          service(),
  growl:          service(),

  layout,
  classNames:     ['medium-modal'],

  onlyIstio: true,

  istioApp:      alias('modalService.modalOpts.istioApp'),
  cluster:       alias('scope.currentCluster'),

  didRender() {
    setTimeout(() => {
      try {
        $('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },

  actions: {
    confirm() {
      const {
        istioApp, onlyIstio, cluster
      } = this
      const { systemProject } = cluster;
      const istioSystemNamespace       = ( systemProject.namespaces || []).findBy('id', 'istio-system');

      set(this, 'saving', true)

      const promises = [istioApp.delete(), istioSystemNamespace.delete()];

      if (!onlyIstio) {
        promises.pushObject(cluster.doAction('disableMonitoring'))
      }

      PromiseAll(promises).then(() => {
        setTimeout(() => {
          window.location.href = window.location.href; // eslint-disable-line no-self-assign
        }, 1000);
      }).catch((err) => {
        get(this, 'growl').fromError(get(err, 'body.message'));
      }).finally(() => {
        set(this, 'saving', false)
        this.send('cancel');
      })
    },
  },
});
