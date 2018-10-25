import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { eachLimit } from 'async';

export default Component.extend(ModalBase, {
  growl: service(),

  layout,
  classNames: ['large-modal'],

  aggressive:         false,
  usePodGracePeriod:  true,
  gracePeriod:        30,
  unlimitedTimeout:   false,
  timeout:            60,

  resources: alias('modalService.modalOpts.resources'),

  actions: {
    drain() {
      const aggressive = get(this, 'aggressive');

      const opts = {
        deleteLocalData:  aggressive,
        force:            aggressive,
        ignoreDaemonSets: true,
        gracePeriod:      get(this, 'usePodGracePeriod') ? -1 : get(this, 'gracePeriod'),
        timeout:          get(this, 'unlimitedTimeout')  ?  0 : get(this, 'timeout'),
      };

      const resources = get(this, 'resources').slice();

      eachLimit(resources, 5, (resource, cb) => {
        if ( !resource ) {
          return cb();
        }

        resource.doAction('drain', opts).finally(cb);
      });

      this.send('cancel');
    },
  },
});
