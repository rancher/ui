import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

const Template = Resource.extend({
  scope:    service(),
  settings: service(),
  intl:     service(),

  headers: function() {
    return { [C.HEADER.PROJECT_ID]: this.get('projects.current.id') };
  }.property('project.current.id'),

  cleanProjectUrl: computed('links.project', function() {
    let projectUrl = this.get('links.project');
    let pattern = new RegExp('^([a-z]+://|//)', 'i');

    if (projectUrl) {
      if (!pattern.test(projectUrl)) {
        projectUrl = `http://${ projectUrl }`;
      }
    }

    return htmlSafe(projectUrl);
  }),

  categoryArray: function() {
    let out = this.get('categories');

    if ( !out || !out.length ) {
      let single = this.get('category');

      if ( single ) {
        out = [single];
      } else {
        out = [];
      }
    }

    return out;
  }.property('category', 'categories.[]'),

  categoryLowerArray: function() {
    return this.get('categoryArray').map((x) => (x || '').underscore().toLowerCase());
  }.property('categoryArray.[]'),

  certifiedType: function() {
    let str = null;
    let labels = this.get('labels');

    if ( labels && labels[C.LABEL.CERTIFIED] ) {
      str = labels[C.LABEL.CERTIFIED];
    }

    if ( str === C.LABEL.CERTIFIED_RANCHER && this.get('catalogId') === C.CATALOG.LIBRARY_KEY ) {
      return 'rancher';
    } else if ( str === C.LABEL.CERTIFIED_PARTNER ) {
      return 'partner';
    } else {
      return 'thirdparty';
    }
  }.property('catalogId'),

  certifiedClass: function() {
    let type = this.get('certifiedType');

    if ( type === 'rancher' && this.get('settings.isRancher') ) {
      return 'badge-rancher-logo';
    } else {
      return `badge-${  type }`;
    }
  }.property('certifiedType'),

  certified: function() {
    let out = null;
    let labels = this.get('labels');

    if ( labels && labels[C.LABEL.CERTIFIED] ) {
      out = labels[C.LABEL.CERTIFIED];
    }

    let looksLikeCertified = false;

    if ( out ) {
      let display = this.get('intl').t('catalogPage.index.certified.rancher.rancher');

      looksLikeCertified = normalize(out) === normalize(display);
    }

    if ( this.get('catalogId') !== C.CATALOG.LIBRARY_KEY && (out === C.LABEL.CERTIFIED_RANCHER || looksLikeCertified) ) {
      // Rancher-certified things can only be in the library catalog.
      out = null;
    }

    // For the standard labels, use translations
    if ( [C.LABEL.CERTIFIED_RANCHER, C.LABEL.CERTIFIED_PARTNER].includes(out) ) {
      let pl = 'pl';

      if ( this.get('settings.isRancher') ) {
        pl = 'rancher';
      }

      return this.get('intl').t(`catalogPage.index.certified.${ pl }.${ out }`);
    }

    // For custom strings, use what they said.
    return out;
  }.property('certifiedType', 'catalogId', 'labels'),

});

function normalize(str) {
  return (str || '').replace(/[^a-z]/gi, '').toLowerCase();
}

export default Template;
