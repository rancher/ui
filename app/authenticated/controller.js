import { schedule } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import C from 'ui/utils/constants';
import { computed, get } from '@ember/object';
import { on } from '@ember/object/evented';

export default Controller.extend({
  settings:    service(),
  prefs:       service(),
  scope:       service(),
  intl:        service(),

  application: controller(),
  error:       null,
  azureAd:     null,

  isPopup:     alias('application.isPopup'),
  pageScope:   alias('scope.currentPageScope'),

  hasHosts: computed.gt('model.hosts.length', 0),

  init(){
    this._super(...arguments)
    get(this, 'globalStore').find('authconfig', 'azuread', { forceReload: true }).then((config) => {
      this.set('azureAd', config)
    })
  },

  azureNeedsUpdate: computed('azureAd.enabled', 'azureAd.annotations', function(){
    const azureAd = get(this, 'azureAd')

    if (!azureAd){
      return false
    }
    const isEnabled = get(azureAd, 'enabled')

    return isEnabled && (get(azureAd, 'annotations') || {})[C.AZURE_AD.ANNOTATION_MIGRATED] !== 'true'
  }),

  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      this.get('application').setProperties({
        error:             null,
        error_description: null,
        state:             null,
      });

      let bg = this.get(`prefs.${ C.PREFS.BODY_BACKGROUND }`);

      if ( bg ) {
        $('BODY').css('background', bg); // eslint-disable-line
      }

      // Add class to hide Page Header and Footer when embedded
      const embedded = window.top !== window;

      if (embedded) {
        $('BODY').addClass('embedded'); // eslint-disable-line
      }
    });
  }),

});