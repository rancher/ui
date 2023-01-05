import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import $ from 'jquery';

export default Component.extend(ModalBase, {
  intl: service(),

  layout,
  classNames:     ['medium-modal', 'modal-logs'],
  alternateLabel,
  originalModel:  alias('modalService.modalOpts.originalModel'),
  batchModels:    alias('modalService.modalOpts.batchModels'),
  action:         alias('modalService.modalOpts.action'),
  didRender() {
    setTimeout(() => {
      try {
        $('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  },

  actions:        {

    confirm() {
      const multi = this.get('batchModels');

      // If there are multiple items, go through each
      if (multi && multi.length) {
        multi.forEach((model) => {
          model.send(this.get('action'));
        });
      } else {
        this.get('originalModel').send(this.get('action'));
      }
      this.send('cancel');
    },
  },

  list: computed('originalModel', 'batchModels', function() {
    const multi = this.get('batchModels');

    if (multi && multi.length) {
      return multi.map(v => v.displayName).sort().join(', ');
    }

    return this.get('originalModel').displayName;
  }),

  isNodeDriver: computed('originalModel.type', function() {
    return get(this, 'originalModel.type') === 'nodeDriver';
  }),

  isClusterDriver: computed('originalModel.type', function() {
    return get(this, 'originalModel.type') === 'kontainerDriver';
  }),

  isService:     computed('originalModel.type', 'intl.locale', function() {
    let type = this.get('originalModel.type');
    let out  = {};
    let intl = this.get('intl');

    switch (type) {
    case 'project':
      out.message = intl.t('modalConfirmDeactivate.buttons.project.message');
      out.button  = intl.t('modalConfirmDeactivate.buttons.project.button');
      break;
    case 'environment':
      out.message = intl.t('modalConfirmDeactivate.buttons.environment.message');
      out.button  = intl.t('modalConfirmDeactivate.buttons.environment.button');
      break;
    default:
      out.message = intl.t('modalConfirmDeactivate.buttons.default.message');
      out.button  = intl.t('modalConfirmDeactivate.buttons.default.button');
      break;
    }

    return out;
  }),
});
