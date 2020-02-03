import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { eachLimit } from 'async';
import { prepareForBackend } from 'shared/components/drain-node/component';

export default Component.extend(ModalBase, {
  growl: service(),

  layout,
  classNames: ['large-modal'],

  selection: {},

  resources: alias('modalService.modalOpts.resources'),

  actions: {
    drain() {
      const nodeDrainInput = { ...get(this, 'selection') };

      prepareForBackend(nodeDrainInput);


      const resources = get(this, 'resources').slice();

      eachLimit(resources, 5, (resource, cb) => {
        if ( !resource ) {
          return cb();
        }

        resource.doAction('drain', nodeDrainInput).finally(cb);
      });

      this.send('cancel');
    },
  },
});
