import Component from '@ember/component';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import jsondiffpatch from 'jsondiffpatch';
import ModalBase from 'shared/mixins/modal-base';

import layout from './template';

const HIDDEN_FIELDS = ['created', 'createdTS', 'links', 'actionLinks', 'id', 'conditions', 'uuid'];

function sanitize(config) {
  const result = {};

  Object.keys(config).forEach((key) => {
    if (!HIDDEN_FIELDS.includes(key)) {
      result[key] = config[key]
    }
  });

  return result;
}

export default Component.extend(ModalBase, {
  modalService: service('modal'),

  layout,
  classNames: ['modal-container', 'large-modal', 'large-height', 'alert'],
  diff:       '',

  didReceiveAttrs() {
    const templates = get(this, 'modalService.modalOpts');

    if (templates.length === 2) {
      const delta = jsondiffpatch.diff(sanitize(templates[0]), sanitize(templates[1]));

      jsondiffpatch.formatters.html.hideUnchanged();

      const diff = jsondiffpatch.formatters.html.format(delta, templates[0]).htmlSafe();

      set(this, 'diff', diff);
    }
  },

  cancel() {
    get(this, 'modalService').toggleModal();
  },
});
