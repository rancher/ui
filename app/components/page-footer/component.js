import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),
  prefs: Ember.inject.service(),
  githubBase: C.EXT_REFERENCES.GITHUB,
  forumBase: C.EXT_REFERENCES.FORUM,
  slackBase: C.EXT_REFERENCES.SLACK,

  projectId        : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),

  modalService: Ember.inject.service('modal'),

  init() {
    this._super(...arguments);
    let settings = this.get('settings');

    let cli = {};
    Object.keys(C.SETTING.CLI_URL).forEach((key) => {
      cli[key.toLowerCase()] = settings.get(C.SETTING.CLI_URL[key]);
    });

    let compose = {};
    Object.keys(C.SETTING.COMPOSE_URL).forEach((key) => {
      compose[key.toLowerCase()] = settings.get(C.SETTING.COMPOSE_URL[key]);
    });

    this.setProperties({
      cli: cli,
      compose: compose,
    });
  },

  actions: {
    showAbout() {
      this.get('modalService').toggleModal('modal-about', {
        closeWithOutsideClick: true
      });
    },
  }
});


