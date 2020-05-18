import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  intl:         service(),

  settings:     service(),
  prefs:        service(),
  modalService: service('modal'),

  layout,
  tagName:      'footer',
  className:    'clearfix',

  projectId: alias(`cookies.${ C.COOKIE.PROJECT }`),

  init() {
    this._super(...arguments);
    let settings = this.get('settings');

    let cli = {};

    Object.keys(C.SETTING.CLI_URL).forEach((key) => {
      cli[key.toLowerCase()] = settings.get(C.SETTING.CLI_URL[key]);
    });

    this.setProperties({ cli });
  },

  actions: {
    showAbout() {
      this.get('modalService').toggleModal('modal-about', { closeWithOutsideClick: true });
    },
    showWechat() {
      this.get('modalService').toggleModal('modal-wechat', { closeWithOutsideClick: true });
    },
  },

  showWechat: computed('intl.locale', function() {
    let locale = this.get('intl.locale');

    if (locale) {
      return locale[0] === 'zh-hans';
    }

    return false;
  }),

  showGithubIssuesLink: computed('settings.emailIssuesLink', function() {
    const { emailIssuesLink } = this.settings;

    if (isEmpty(emailIssuesLink)) {
      return true;
    }

    return false;
  }),

  githubBase:   C.EXT_REFERENCES.GITHUB,
  forumBase:    C.EXT_REFERENCES.FORUM,
  cnforumBase:  C.EXT_REFERENCES.CN_FORUM,
  slackBase:    C.EXT_REFERENCES.SLACK,

});
