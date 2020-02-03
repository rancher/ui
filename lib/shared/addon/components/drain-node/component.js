import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const MAX_TIMEOUT = 10800;

export function prepareForBackend(selection) {
  if ( selection.usePodGracePeriod ) {
    set(selection, 'gracePeriod', null);
  }

  if ( selection.unlimitedTimeout ) {
    set(selection, 'timeout', MAX_TIMEOUT);
  }
}

export default Component.extend({
  intl: service(),

  layout,

  editable:  true,
  selection: null,

  view:      computed.not('editable'),
  init() {
    this._super(...arguments);

    if ( typeof this.selection.deleteLocalData === 'undefined') {
      set(this, 'selection.deleteLocalData', false);
    }
    if ( typeof this.selection.usePodGracePeriod === 'undefined') {
      set(this, 'selection.usePodGracePeriod', this.selection.gracePeriod === -1);
    }
    if ( typeof this.selection.gracePeriod === 'undefined' || this.selection.gracePeriod === -1) {
      set(this, 'selection.gracePeriod', 30);
    }
    if ( typeof this.selection.unlimitedTimeout === 'undefined') {
      set(this, 'selection.unlimitedTimeout', this.selection.timeout === MAX_TIMEOUT);
    }
    if ( typeof this.selection.timeout === 'undefined' || this.selection.timeout === MAX_TIMEOUT) {
      set(this, 'selection.timeout', 60);
    }
  },
  mode: computed('selection.deleteLocalData', function() {
    return this.selection.deleteLocalData ? this.intl.t('drainNode.aggressive.label') : this.intl.t('drainNode.safe.label');
  }),
  gracePeriodForPods: computed('selection.usePodGracePeriod', 'selection.gracePeriod', function() {
    return this.selection.usePodGracePeriod
      ? this.intl.t('drainNode.gracePeriod.default')
      : this.intl.t('drainNode.gracePeriod.view.custom', { seconds: this.selection.gracePeriod });
  }),
  timeout: computed('selection.unlimitedTimeout', 'selection.timeout', function() {
    return this.selection.unlimitedTimeout
      ? this.intl.t('drainNode.timeout.default')
      : this.intl.t('drainNode.timeout.view.custom', { seconds: this.selection.timeout });
  }),
});
