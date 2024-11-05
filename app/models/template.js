import { htmlSafe } from '@ember/string';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { reference } from 'ember-api-store/utils/denormalize';
import { compare as compareVersion } from 'ui/utils/parse-version';

const Template = Resource.extend({
  scope:    service(),
  settings: service(),
  intl:     service(),

  catalogRef:     reference('catalogId'),
  clusterCatalog: reference('clusterCatalogId', 'clusterCatalog', 'store'),
  projectCatalog: reference('projectCatalogId'),

  latestVersion:  computed('versionLinks', function() {
    const  links = this.versionLinks;

    return get(Object.keys(links || {}).sort((a, b) => compareVersion(a, b)), 'lastObject');
  }),

  isGlobalCatalog:  computed('clusterCatalog', 'projectCatalog', function() {
    if (!this.clusterCatalog && !this.projectCatalog) {
      return true;
    } else {
      return false;
    }
  }),

  isIstio: computed('labels', function() {
    const labels = this.labels || {};

    return labels[C.LABEL_ISTIO_RULE] === 'true';
  }),

  displayCatalogId: computed('catalogRef', 'clusterCatalog', 'projectCatalog', function() {
    const {
      catalogRef, clusterCatalog, projectCatalog, clusterCatalogId, catalogId, projectCatalogId
    } = this;

    let out = '';

    if ( catalogRef && catalogRef.name ) {
      out = catalogRef.name;
    } else if ( clusterCatalog && clusterCatalog.name ) {
      out = clusterCatalog.name;
    } else if ( projectCatalog && projectCatalog.name ) {
      out = projectCatalog.name;
    } else if ( catalogId ) {
      out = catalogId;
    } else if ( clusterCatalogId ) {
      out = clusterCatalogId.substr(clusterCatalogId.indexOf(':') + 1)
    } else if ( projectCatalogId ) {
      out = projectCatalogId;
    }

    return out;
  }),

  headers: computed('project.current.id', 'projects.current.id', function() {
    return { [C.HEADER.PROJECT_ID]: get(this, 'projects.current.id') };
  }),

  cleanProjectUrl: computed('links.project', function() {
    let projectUrl = get(this, 'links.project');
    let pattern    = new RegExp('^([a-z]+://|//)', 'i');

    if (projectUrl) {
      if (!pattern.test(projectUrl)) {
        projectUrl = `http://${ projectUrl }`;
      }
    }

    return htmlSafe(projectUrl);
  }),

  categoryArray: computed('category', 'categories.[]', function() {
    let out = this.categories;

    if ( !out || !out.length ) {
      let single = this.category;

      if ( single ) {
        out = [single];
      } else {
        out = [];
      }
    }

    return out;
  }),

  categoryLowerArray: computed('categoryArray.[]', function() {
    return this.categoryArray.map((x) => (x || '').underscore().toLowerCase());
  }),

  certifiedType: computed('catalogId', 'labels', function() {
    let str = null;
    let labels = this.labels;

    if ( labels && labels[C.LABEL.CERTIFIED] ) {
      str = labels[C.LABEL.CERTIFIED];
    }

    if ( str === C.LABEL.CERTIFIED_RANCHER && this.catalogId === C.CATALOG.LIBRARY_KEY ) {
      return 'rancher';
    } else if ( str === C.LABEL.CERTIFIED_PARTNER ) {
      return 'partner';
    } else {
      return 'thirdparty';
    }
  }),

  certifiedClass: computed('certifiedType', 'settings.isRancher', function() {
    let type = this.certifiedType;

    if ( type === 'rancher' && get(this, 'settings.isRancher') ) {
      return 'badge-rancher-logo';
    } else {
      return `badge-${  type }`;
    }
  }),

  certified: computed('catalogId', 'certifiedType', 'intl.locale', 'labels', 'settings.isRancher', function() {
    let out = null;
    let labels = this.labels;

    if ( labels && labels[C.LABEL.CERTIFIED] ) {
      out = labels[C.LABEL.CERTIFIED];
    }

    let looksLikeCertified = false;

    if ( out ) {
      let display = this.intl.t('catalogPage.index.certified.rancher.rancher');

      looksLikeCertified = normalize(out) === normalize(display);
    }

    if ( this.catalogId !== C.CATALOG.LIBRARY_KEY && (out === C.LABEL.CERTIFIED_RANCHER || looksLikeCertified) ) {
      // Rancher-certified things can only be in the library catalog.
      out = null;
    }

    // For the standard labels, use translations
    if ( [C.LABEL.CERTIFIED_RANCHER, C.LABEL.CERTIFIED_PARTNER, C.LABEL.CERTIFIED_RANCHER_EXPERIMENTAL].includes(out) ) {
      let pl = 'pl';

      if ( get(this, 'settings.isRancher') ) {
        pl = 'rancher';
      }

      return this.intl.t(`catalogPage.index.certified.${ pl }.${ out }`);
    }

    // For custom strings, use what they said.
    return out;
  }),

});

function normalize(str) {
  return (str || '').replace(/[^a-z]/gi, '').toLowerCase();
}

export default Template;
