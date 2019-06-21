import {  get, set, observer, setProperties } from '@ember/object';
import Component from '@ember/component';
import { convertToMillis } from 'shared/utils/util';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';

export default Component.extend({
  layout,

  limit:          null,

  init() {
    this._super(...arguments);

    setProperties(this, {
      requestsCpu:    convertToMillis(get(this, 'limit.requestsCpu')),
      limitsCpu:      convertToMillis(get(this, 'limit.limitsCpu')),
    });

    if ( get(this, 'limit.requestsMemory') ) {
      set(this, 'requestsMemory', parseSi(get(this, 'limit.requestsMemory'), 1024) / 1048576);
    }

    if ( get(this, 'limit.limitsMemory') ) {
      set(this, 'limitsMemory', parseSi(get(this, 'limit.limitsMemory'), 1024) / 1048576);
    }
  },

  limitChanged: observer('requestsCpu', 'limitsCpu', 'requestsMemory', 'limitsMemory', function() {
    const requestsCpu    = get(this, 'requestsCpu');
    const limitsCpu      = get(this, 'limitsCpu');
    const requestsMemory = get(this, 'requestsMemory');
    const limitsMemory   = get(this, 'limitsMemory');
    const out            = {};

    if ( requestsCpu ) {
      set(out, 'requestsCpu', `${ requestsCpu }m`)
    }

    if ( limitsCpu ) {
      set(out, 'limitsCpu', `${ limitsCpu }m`)
    }

    if ( requestsMemory ) {
      set(out, 'requestsMemory', `${ requestsMemory }Mi`)
    }

    if ( limitsMemory ) {
      set(out, 'limitsMemory', `${ limitsMemory }Mi`)
    }

    if (this.changed) {
      this.changed(out);
    }
  })
});
