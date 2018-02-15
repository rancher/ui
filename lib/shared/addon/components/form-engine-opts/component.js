import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,
  machine: null,
  settings: service(),
  intl: service(),
  showEngineUrl: null,

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
        item.toggleProperty('expanded');
      });
    }

    if ( this.get('machine.engineInstallUrl') === undefined && this.get('showEngineUrl') ) {
      this.set('machine.engineInstallUrl', this.get(`settings.${C.SETTING.ENGINE_URL}`) || '');
    }
  },

  engineUrlChoices: function() {
    let def = this.get(`settings.${C.SETTING.ENGINE_URL}`);
    let out = [
      {label: this.get('intl').t('formEngineOpts.engineInstallUrl.recommended'), value: def},
      {label: 'v1.12.x',  value: 'https://releases.rancher.com/install-docker/1.12.sh'},
      {label: 'v1.13.x',  value: 'https://releases.rancher.com/install-docker/1.13.sh'},
      {label: 'v17.03.x', value: 'https://releases.rancher.com/install-docker/17.03.sh'},
      {label: 'v17.06.x', value: 'https://releases.rancher.com/install-docker/17.06.sh'},
      {label: 'v17.09.x', value: 'https://releases.rancher.com/install-docker/17.09.sh'},
      {label: 'v17.12.x', value: 'https://releases.rancher.com/install-docker/17.12.sh'},
      {label: this.get('intl').t('formEngineOpts.engineInstallUrl.latest'), value: 'https://get.docker.com'},
    ];

    return out;
  }.property('intl.locale',`settings.${C.SETTING.ENGINE_URL}`),

  actions: {
    setEngine(url) {
      this.set('machine.engineInstallUrl', url);
    }
  }
});
