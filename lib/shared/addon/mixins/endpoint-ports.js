import { get, computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import Util from 'ui/utils/util';

export default Mixin.create({

  displayEndpoints: computed('publicEndpoints.@each.{address,port,protocol}', function() {
    let parts = [];
    const endpoints = (get(this, 'publicEndpoints') || []).sort(Util.compareDisplayEndpoint);

    endpoints.forEach((endpoint) => {
      if ( !get(endpoint, 'isReady') ){
        return;
      }
      if (get(endpoint, 'isTcpish')) {
        parts.push(`${ '<span>' +
          '<a target="_blank" rel="noreferrer nofollow noopener" href="' }${  Util.escapeHtml(get(endpoint, 'linkEndpoint'))  }">${
          Util.escapeHtml(get(endpoint, 'displayEndpoint'))
        }</a>` +
          `</span>`);
      } else {
        parts.push(`<span>${  Util.escapeHtml(get(endpoint, 'displayEndpoint'))  }</span>`);
      }
    });

    let pub = parts.join(', ');

    if (pub) {
      return pub.htmlSafe();
    } else {
      return '';
    }
  }),
});
