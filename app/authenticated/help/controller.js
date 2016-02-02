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
  docsLink: C.EXT_REFERENCES.DOCS,

  latestAnnouncement: Ember.computed('model.annoucements', function() {
    if (this.get('model.annoucements.topics')) {
      var annoucement = this.get('model.annoucements.topics')[0];
      return {
        title: annoucement.title,
        link: `${this.get('forumsLink')}/t/${annoucement.slug}`,
        created: annoucement.created_at
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
