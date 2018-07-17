import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';
import { escapeHtml } from 'shared/utils/util';

export default Helper.extend({
  intl: service(),

  compute(params/* , options*/) {
    let name = params[0] || '';

    if ( name.substr(0, 1) === '*' ) {
      return name;
    } else {
      return (`<a href="https://${ encodeURIComponent(name) }" target="_blank" rel="nofollow noreferrer noopener">${ escapeHtml(name) } <i class="icon icon-sm icon-external-link"/></a>`).htmlSafe();
    }
  }
});
