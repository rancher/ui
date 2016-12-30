import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),

  modelError: false,
  modelResolved: false,
  hasHosts: true,
  forumsLink: C.EXT_REFERENCES.FORUM,
  companyLink: C.EXT_REFERENCES.COMPANY,
  githubLink: C.EXT_REFERENCES.GITHUB,
  docsLink: Ember.computed.alias('settings.docsBase'),

  latestAnnouncement: Ember.computed('model.announcements', function() {
    if (this.get('model.announcements.topics')) {
      let sorted = this.get('model.announcements.topics').sortBy('id');
      var announcement = sorted[sorted.length-1];
      return {
        title: announcement.title,
        link: `${this.get('forumsLink')}/t/${announcement.slug}`,
        created: announcement.created_at
      };
    }
  }),

  modelObserver: function() {
    if (this.get('model.resolved')) {

      // @@TODO@@ - need to add some error handling
      this.set('modelResolved', true);
    }

    if (this.get('model.error') ) {

      this.set('modelError', true);
    }

  }.observes('model'),

});
