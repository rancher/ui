import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import ModalBase from 'shared/mixins/modal-base';
import { isDevBuild } from 'shared/utils/parse-version';
import layout from './template';

export default Component.extend(ModalBase, {
  settings:   service(),
  layout,
  classNames: ['modal-container', 'span-6', 'offset-3', 'modal-telemetry', 'alert'],
  optIn:      null,

  init() {
    this._super(...arguments);

    const cur = get(this, `settings.${ C.SETTING.TELEMETRY }`);
    const version = get(this, 'settings.rancherVersion');
    let optIn;

    if ( !version || isDevBuild(version) ) {
      // For dev builds, default to opt out
      optIn = (cur === 'in');
    } else {
      // For releases, default to opt in
      optIn = (cur !== 'out');
    }

    set(this, 'optIn', optIn);
  },

  actions: {
    cancel() {
      get(this, 'settings').set(C.SETTING.TELEMETRY, (get(this, 'optIn') ? 'in' : 'out'));
      get(this, 'modalService').toggleModal();
    },
  },
});
