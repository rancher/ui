import Component from '@ember/component';
import { strPad } from 'shared/utils/util';
import { get, computed } from '@ember/object';

export default Component.extend({
  nameParts: computed('model.prefix','model.count', function() {
    let input = get(this, 'model.prefix')||'';
    let count = get(this, 'model.count');
    let match = input.match(/^(.*?)([0-9]+)$/);

    let prefix, minLength, start;
    if ( match && match.length )
    {
      prefix = match[1];
      minLength = (match[2]+'').length;
      start = parseInt(match[2],10);
    }
    else
    {
      prefix = input;
      minLength = 1;
      start = 1;
    }

    // app98 and count = 3 will go to 101, so the minLength should be 3
    let end = start + count - 1;
    minLength = Math.max(minLength, (end+'').length);

    return {
      prefix: prefix,
      minLength: minLength,
      start: start,
      end: end
    };
  }),

  nameCountLabel: computed('nameParts','intl.locale', function() {
    let parts = get(this, 'nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix ) {
      // qty=1 or no input yet, nothing to see here...
      return '';
    }

    let first = parts.prefix + strPad(parts.start, parts.minLength, '0');
    let last = parts.prefix + strPad(parts.end, parts.minLength, '0');
    if ( first === last ) {
      return get(this, 'intl').tHtml('nodeConfigRow.singleHostname',{first: first, last: last});
    } else {
      return get(this, 'intl').tHtml('nodeConfigRow.multiHostnames',{first: first, last: last});
    }
  }),
});
