import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  settings: service(),
  intl:     service(),

  layout,
  machine:       null,
  showEngineUrl: null,
  defaultEngine: alias(`settings.${ C.SETTING.ENGINE_URL }`),

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
  engineUrlChoices: computed(`settings.${ C.SETTING.ENGINE_URL }`, 'defaultEngine', 'intl.locale', function() {
    let defaultEngine = get(this, 'defaultEngine');
    const defaultEngineVersionObj = {
      label: get(this, 'intl').t('formEngineOpts.engineInstallUrl.recommendedNoVersion'),
      value: defaultEngine
    };

    try {
      const defaultEngineVersion = defaultEngine.split('/').lastObject.replace('.sh', '');

      if (!isEmpty(defaultEngineVersion)) {
        defaultEngineVersionObj.label = get(this, 'intl').t('formEngineOpts.engineInstallUrl.recommended', { version: defaultEngineVersion });
      }
    } catch (_err) {}

    let out           = [
      defaultEngineVersionObj,
      {
        label: 'v19.03.x',
        value: 'https://releases.rancher.com/install-docker/19.03.sh'
      },
      {
        label: 'v18.09.x',
        value: 'https://releases.rancher.com/install-docker/18.09.sh'
      },
      {
        label: 'v18.06.x',
        value: 'https://releases.rancher.com/install-docker/18.06.sh'
      },
      {
        label: 'v17.06.x',
        value: 'https://releases.rancher.com/install-docker/17.06.sh'
      },
      {
        label: 'v17.03.x',
        value: 'https://releases.rancher.com/install-docker/17.03.sh'
      },
      {
        label: get(this, 'intl').t('formEngineOpts.engineInstallUrl.latest'),
        value: 'https://get.docker.com'
      },
      {
        label: get(this, 'intl').t('formEngineOpts.engineInstallUrl.none.label'),
        value: 'none'
      },
    ];

    return out;
  }),

});
