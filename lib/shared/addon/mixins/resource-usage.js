import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { formatPercent } from 'shared/utils/util';
import { formatSi, parseSi, exponentNeeded } from 'shared/utils/parse-unit';
import { inject as service } from '@ember/service';

export default Mixin.create({
  intl: service(),

  cpuTotal: computed('allocatable.cpu', function() {
    const total = parseSi(get(this, 'allocatable.cpu'));

    if ( total ) {
      const minExp = exponentNeeded(total);
      const totalStr = formatSi(total, 1000, '', '', 0, minExp, 1);

      return `${ totalStr } Core${  totalStr === '1' ? '' : 's' }`;
    } else {
      return null;
    }
  }),

  memoryTotal: computed('allocatable.memory', function() {
    const total = parseSi(get(this, 'allocatable.memory'));

    if ( total ) {
      const minExp = exponentNeeded(total);
      const totalStr = formatSi(total, 1024, 'iB', 'B', 0, minExp, 1);

      return totalStr;
    } else {
      return null;
    }
  }),

  cpuUsage: computed('requested.cpu', 'allocatable.cpu', function() {
    const used  = parseSi(get(this, 'requested.cpu')) || 0;
    const total = parseSi(get(this, 'allocatable.cpu'));

    if ( total ) {
      const minExp = exponentNeeded(total);
      const usedStr  = formatSi(used,  1000, '', '', 0, minExp, 1).replace(/\s.*$/, '');
      const totalStr = formatSi(total, 1000, '', '', 0, minExp, 1);

      return `${ usedStr }/${ totalStr } Core${  totalStr === '1' ? '' : 's' }`;
    } else {
      return null;
    }
  }),

  cpuPercent: computed('requested.cpu', 'allocatable.cpu', function() {
    const used  = parseSi(get(this, 'requested.cpu')) || 0;
    const total = parseSi(get(this, 'allocatable.cpu'));

    if ( total ) {
      return formatPercent(100 * used / total, 0);
    } else {
      return null;
    }
  }),

  memoryUsage: computed('requested.memory', 'allocatable.memory', function() {
    const used = parseSi(get(this, 'requested.memory')) || 0;
    const total = parseSi(get(this, 'allocatable.memory'));

    if ( total ) {
      const minExp = exponentNeeded(total);
      const usedStr =  formatSi(used,  1024, '', '', 0, minExp, 1).replace(/\s.*/, '');
      const totalStr = formatSi(total, 1024, 'iB', 'B', 0, minExp, 1);

      return `${ usedStr }/${ totalStr }`
    } else {
      return null;
    }
  }),

  memoryPercent: computed('requested.memory', 'allocatable.memory', function() {
    const used  = parseSi(get(this, 'requested.memory')) || 0;
    const total = parseSi(get(this, 'allocatable.memory'));

    if ( total ) {
      return formatPercent(100 * used / total, 0);
    } else {
      return null;
    }
  }),

  podUsage: computed('requested.pods', 'allocatable.pods', function() {
    const used  = parseSi(get(this, 'requested.pods')) || 0;
    const total = parseSi(get(this, 'allocatable.pods'));

    if ( total ) {
      const minExp = exponentNeeded(total);
      const usedStr  = formatSi(used,  1000, '', '', 0, minExp, 1).replace(/\s.*$/, '');
      const totalStr = formatSi(total, 1000, '', '', 0, minExp, 1);

      return `${ usedStr }/${ totalStr }`
    } else {
      return null;
    }
  }),

  podPercent: computed('requested.pods', 'allocatable.pods', function() {
    const used  = parseSi(get(this, 'requested.pods')) || 0;
    const total = parseSi(get(this, 'allocatable.pods'));

    if ( total ) {
      return formatPercent(100 * used / total, 0);
    } else {
      return null;
    }
  }),
});
