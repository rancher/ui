import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,
  intl:         service(),

  tagName:      'footer',
  className:    'clearfix',

  settings:     service(),
  prefs:        service(),
  githubBase:   C.EXT_REFERENCES.GITHUB,
  forumBase:    C.EXT_REFERENCES.FORUM,
  slackBase:    C.EXT_REFERENCES.SLACK,

  projectId   : alias(`cookies.${C.COOKIE.PROJECT}`),

  modalService: service('modal'),

  init() {
    this._super(...arguments);
    let settings = this.get('settings');

    let cli = {};
    Object.keys(C.SETTING.CLI_URL).forEach((key) => {
      cli[key.toLowerCase()] = settings.get(C.SETTING.CLI_URL[key]);
    });

    this.setProperties({
      cli
    });
  },

  showWechat : computed('intl._locale', function() {
    let locale = this.get('intl._locale');
    if (locale) {
      return locale[0] === 'zh-hans';
    }
    return false;
  }),

  actions: {
    showAbout() {
      this.get('modalService').toggleModal('modal-about', {
        closeWithOutsideClick: true
      });
    },
    showWechat() {
      this.get('modalService').toggleModal('modal-wechat', {
        closeWithOutsideClick: true
      });
    },
  }
});
