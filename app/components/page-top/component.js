import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import layout from './template';
import PageFooter from 'ui/components/page-footer/component';

export default PageFooter.extend({
  layout,
  
  intl: service(),
  access: service(),

  tagName: 'div',
  classNames: 'clearfix page-top',

  pageScope: null,
  
  accessEnabled: alias('access.enabled'),

  actions: {
    toogleMenu: function () {
      set(this, `session.${C.SESSION.HIDE_MENU}`, !get(this, `session.${C.SESSION.HIDE_MENU}`) === true);
    }
  },
});
