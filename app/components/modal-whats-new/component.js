import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { isDevBuild } from 'shared/utils/parse-version';

export default Component.extend(ModalBase, {
  settings:   service(),
  prefs:      service(),
  layout,
  classNames: ['modal-container', 'span-6', 'offset-3', 'modal-whats-new', 'alert'],

  actions: {
    cancel() {
      const version = get(this, 'settings.rancherVersion');

      if ( !isDevBuild(version) ) {
        set(this, `prefs.${ C.PREFS.SEEN_WHATS_NEW }`, version);
      }

      get(this, 'modalService').toggleModal();
    },
  },
});
