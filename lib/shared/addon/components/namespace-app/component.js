import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';

const NONE       = 'none',
      LOADING    = 'loading',
      CURRENT    = 'current',
      AVAILABLE  = 'available',
      REQUIRED   = 'required',
      INPROGRESS = 'inprogress',
      UPGRADED   = 'upgraded',
      NOTFOUND   = 'notfound',
      ERROR      = 'error';

export default Component.extend({
  layout,
  scope: service(),
  classNames: ['namespace-app'],
  srcSet: false,
  latestVersion: null,

  actions: {
    toggle() {
      // this.sendAction('toggle');
    },
    doUpgrade() {
      let templateId = this.get('model.externalIdInfo.templateId');
      let versionId = this.get('latestVersion');
      let catalogId = this.get('model.externalIdInfo.catalog');
      this.get('router').transitionTo('catalog-tab.launch', templateId, {queryParams: {
        upgrade: versionId,
        catalog: catalogId,
        namespaceId: this.get('model.installNamespace'),
        appId: this.get('model.id'),
      }});
    },

  },
  status: NONE,
  upgradeAvailable: computed('model.catalogTemplate', function() {
    var versions = Object.keys(this.get('model.catalogTemplate.versionLinks')||[]);
    var currentVersion = this.get('model.externalIdInfo.version');

    var idx = versions.indexOf(currentVersion);
    if (versions.length > 0) {
      if (idx === 0 && versions.length === 1) {
        this.set('status', CURRENT);
      }

      if (idx !== 0 && idx < versions.length -1) {
        this.set('status', AVAILABLE);
        this.set('latestVersion', versions[versions.length-1]);
      }

      if (idx < versions.length -1) {
        return true;
      } else {
        return false;
      }
    } else {
      this.set('status', NOTFOUND);
      return false;
    }
  }),

  didRender() {
    if (!this.get('srcSet')) {
      this.set('srcSet', true);
      var $icon = this.$('.catalog-icon > img');
      $icon.attr('src', $icon.data('src'));
      this.$('img').on('error', () => {
        $icon.attr('src', `${this.get('app.baseAssets')}assets/images/generic-catalog.svg`);
      });
    }
  }
});
