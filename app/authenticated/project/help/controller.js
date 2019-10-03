import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  settings: service(),
  scope:    service(),

  modelError:    false,
  modelResolved: false,
  hasHosts:      true,
  docsLink:      alias('settings.docsBase'),

  modelObserver: observer('model', function() {
    if (this.get('model.resolved')) {
      // @@TODO@@ - need to add some error handling
      this.set('modelResolved', true);
    }

    if (this.get('model.error') ) {
      this.set('modelError', true);
    }
  }),

  latestAnnouncement: computed('model.announcements', function() {
    if (this.get('model.announcements.topics')) {
      let sorted = this.get('model.announcements.topics').sortBy('id');
      var announcement = sorted[sorted.length - 1];

      return {
        title:   announcement.title,
        link:    `${ this.get('forumsLink') }/t/${ announcement.slug }`,
        created: announcement.created_at
      };
    }
  }),

  forumsLink:  C.EXT_REFERENCES.FORUM,
  companyLink: C.EXT_REFERENCES.COMPANY,
  githubLink:  C.EXT_REFERENCES.GITHUB,
});
