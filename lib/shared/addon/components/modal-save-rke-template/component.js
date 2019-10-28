import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

export default Component.extend(ModalBase, {
  globalStore:  service(),
  growl:        service(),
  modalService: service('modal'),

  layout,

  classNames: ['modal-container', 'medium-modal'],

  clusterTemplateName:         null,
  clusterTemplateRevisionName: null,
  cluster:                     alias('modalService.modalOpts.cluster'),

  actions: {
    save() {
      let {
        cluster,
        clusterTemplateName,
        clusterTemplateRevisionName,
      } = this;

      return cluster.doAction('saveAsTemplate', {
        clusterTemplateName,
        clusterTemplateRevisionName,
      }).then(() => {
        return this.send('cancel');
      }).catch((err) => {
        return this.growl.fromError(err);
      });
    },
  },

  saveDisabled: computed('clusterTemplateName', 'clusterTemplateRevisionName', function() {
    let { clusterTemplateName, clusterTemplateRevisionName } = this;

    if (isEmpty(clusterTemplateName) && isEmpty(clusterTemplateRevisionName)) {
      return true;
    }

    return false;
  }),
});
