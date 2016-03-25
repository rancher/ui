import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  cleanProjectUrl: Ember.computed('links.project', function() {
    let projectUrl = this.get('links.project');
    let pattern = new RegExp('^([a-z]+://|//)', 'i');

    if (projectUrl) {
      if (!pattern.test(projectUrl)) {
        projectUrl = `http://${projectUrl}`;
      }
    }

    return Ember.String.htmlSafe(projectUrl);
  }),
});
