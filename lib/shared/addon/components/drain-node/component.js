import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';

const MAX_TIMEOUT = 10800;
const HONOR_GRACE_PERIOD = -1;

export default Component.extend({
  intl: service(),

  layout,

  editable:          true,
  selection:         null,
  proxyGracePeriod:  null,
  usePodGracePeriod: false,
  proxyTimeout:      null,
  unlimitedTimeout:  false,

  view:      computed.not('editable'),
  init() {
    this._super(...arguments);
    const force = get(this, 'selection.force');
    const deleteLocalData = get(this, 'selection.force');

    set(this, 'selection.force', typeof force === 'string' ? force === 'true' : !!force);
    set(this, 'selection.deleteLocalData', typeof deleteLocalData === 'string' ? deleteLocalData === 'true' : !!deleteLocalData);
    set(this, 'usePodGracePeriod', this.selection.gracePeriod === HONOR_GRACE_PERIOD);
    set(this, 'proxyGracePeriod', this.selection.gracePeriod === HONOR_GRACE_PERIOD ? 30 : this.selection.gracePeriod);
    set(this, 'unlimitedTimeout', this.selection.timeout === MAX_TIMEOUT);
    set(this, 'proxyTimeout', this.selection.timeout === MAX_TIMEOUT ? 60 : this.selection.timeout);
  },
  updateAggressive: observer('aggressive', function() {
    set(this, 'selection.force', get(this, 'aggressive'));
    set(this, 'selection.deleteLocalData', get(this, 'aggressive'));
  }),
  updateGracePeriod: observer('usePodGracePeriod', 'proxyGracePeriod', function() {
    const newGracePeriod = get(this, 'usePodGracePeriod')
      ? HONOR_GRACE_PERIOD
      : get(this, 'proxyGracePeriod');

    set(this, 'selection.gracePeriod', newGracePeriod);
  }),
  updateTimeout: observer('unlimitedTimeout', 'proxyTimeout', function() {
    const newTimeout = get(this, 'unlimitedTimeout')
      ? MAX_TIMEOUT
      : get(this, 'proxyTimeout');

    set(this, 'selection.timeout', newTimeout);
  }),
  gracePeriodForPods: computed('selection.usePodGracePeriod', 'selection.gracePeriod', function() {
    return this.usePodGracePeriod
      ? this.intl.t('drainNode.gracePeriod.default')
      : this.intl.t('drainNode.gracePeriod.view.custom', { seconds: this.selection.gracePeriod });
  }),
  timeout: computed('selection.unlimitedTimeout', 'selection.timeout', function() {
    return this.unlimitedTimeout
      ? this.intl.t('drainNode.timeout.default')
      : this.intl.t('drainNode.timeout.view.custom', { seconds: this.selection.timeout });
  }),
});
