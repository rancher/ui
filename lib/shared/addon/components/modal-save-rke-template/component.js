import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

const DEFAULT_REV_NAME = 'v1';

export default Component.extend(ModalBase, {
  globalStore:  service(),
  growl:        service(),
  modalService: service('modal'),
  router:       service(),

  layout,

  classNames: ['modal-container', 'medium-modal'],

  clusterTemplateName:         null,
  clusterTemplateRevisionName: null,
  cluster:                     alias('modalService.modalOpts.cluster'),

  init() {
    this._super(...arguments);

    set(this, 'clusterTemplateRevisionName', DEFAULT_REV_NAME);
  },


  actions: {
    save() {
      const {
        cluster,
        clusterTemplateName,
        clusterTemplateRevisionName,
      } = this;

      return cluster.doAction('saveAsTemplate', {
        clusterTemplateName,
        clusterTemplateRevisionName,
      }).then(() => {
        return this.cluster.waitForClusterTemplateToBeAttached().then(() => {
          return this.router.transitionTo('global-admin.cluster-templates.detail', this.cluster.clusterTemplateRevisionId);
        });
      }).catch((err) => {
        return this.growl.fromError(err);
      });
    },
  },

  saveDisabled: computed('clusterTemplateName', 'clusterTemplateRevisionName', function() {
    const { clusterTemplateName, clusterTemplateRevisionName } = this;

    if (isEmpty(clusterTemplateName) && isEmpty(clusterTemplateRevisionName)) {
      return true;
    }

    return false;
  }),
});
