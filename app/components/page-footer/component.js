import Ember from 'ember';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),
  githubBase: C.EXT_REFERENCES.GITHUB,
  forumBase: C.EXT_REFERENCES.FORUM,

  projectId        : Ember.computed.alias(`tab-session.${C.TABSESSION.PROJECT}`),

  modalService: Ember.inject.service('modal'),
  actions: {
    showAbout() {
      this.get('modalService').toggleModal('modal-about', {
        closeWithOutsideClick: true
      });
    },

    composeDownload(os) {
      var url = this.get('settings').get(C.SETTING.COMPOSE_URL[os.toUpperCase()]);
      if ( url )
      {
        Util.download(url);
      }
    },

    cliDownload(os) {
      var url = this.get('settings').get(C.SETTING.CLI_URL[os.toUpperCase()]);
      if ( url )
      {
        Util.download(url);
      }
    },
  }
});


