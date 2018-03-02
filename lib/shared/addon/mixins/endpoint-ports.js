import { get } from '@ember/object';
import Mixin from '@ember/object/mixin';
import Util from 'ui/utils/util';
import { inject as service } from '@ember/service';

export default Mixin.create({

  displayEndpoints: function () {
    let parts = [];
    const endpoints = (get(this, 'publicEndpoints') || []);

    endpoints.forEach((endpoint) => {
      if (get(endpoint, 'isTcp')) {
        parts.push('<span>' +
          '<a target="_blank" rel="noreferrer nofollow noopener" href="' + Util.escapeHtml(get(endpoint, 'linkEndpoint')) + '">' +
          Util.escapeHtml(get(endpoint, 'displayEndpoint')) +
          '</a>' +
          '</span>');
      } else {
        parts.push('<span>' + Util.escapeHtml(get(endpoint, 'displayEndpoint')) + '</span>');
      }
    });

    let pub = parts.join(" / ");

    if (pub) {
      return pub.htmlSafe();
    }
    else {
      return '';
    }
  }.property('publicEndpoints.@each.{address,port,protocol}'),
});
