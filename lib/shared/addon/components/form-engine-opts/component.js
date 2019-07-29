import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { get, computed, set } from '@ember/object';

export default Component.extend({
  settings: service(),
  intl:     service(),

  layout,
  machine:       null,
  showEngineUrl: null,

  didReceiveAttrs() {
    if (!get(this, 'expandFn')) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  actions: {
    setEngine(url) {
      set(this, 'machine.engineInstallURL', url);
    }
  },

  engineUrlChoices: computed('intl.locale', `settings.${ C.SETTING.ENGINE_URL }`, function() {
    let def = get(this, `settings.${ C.SETTING.ENGINE_URL }`);
    let out = [
      {
        label: get(this, 'intl').t('formEngineOpts.engineInstallUrl.recommended'),
        value: def
      },
      {
        label: 'v1.13.x',
        value: 'https://releases.rancher.com/install-docker/1.13.sh'
      },
      {
        label: 'v17.03.x',
        value: 'https://releases.rancher.com/install-docker/17.03.sh'
      },
      {
        label: 'v17.06.x',
        value: 'https://releases.rancher.com/install-docker/17.06.sh'
      },
      {
        label: 'v18.06.x',
        value: 'https://releases.rancher.com/install-docker/18.06.sh'
      },
      {
        label: 'v18.09.x',
        value: 'https://releases.rancher.com/install-docker/18.09.sh'
      },
      {
        label: 'v19.03.x',
        value: 'https://releases.rancher.com/install-docker/19.03.sh'
      },
      {
        label: get(this, 'intl').t('formEngineOpts.engineInstallUrl.latest'),
        value: 'https://get.docker.com'
      },
    ];

    return out;
  }),

});
