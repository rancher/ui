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

    // Default Engine version - store, so we can check if the option is already in the list below
    let defaultEngineVersion = '';

    try {
      defaultEngineVersion = defaultEngine.split('/').lastObject.replace('.sh', '');

      if (!isEmpty(defaultEngineVersion)) {
        defaultEngineVersionObj.label = get(this, 'intl').t('formEngineOpts.engineInstallUrl.recommended', { version: defaultEngineVersion });
      }
    } catch (_err) {}

    let out           = [
      {
        label: 'v27.2.x',
        value: 'https://releases.rancher.com/install-docker/27.2.sh'
      },
      {
        label: 'v27.1.x',
        value: 'https://releases.rancher.com/install-docker/27.1.sh'
      },
      {
        label: 'v27.0.x',
        value: 'https://releases.rancher.com/install-docker/27.0.sh'
      },
      {
        label: 'v26.1.x',
        value: 'https://releases.rancher.com/install-docker/26.1.sh'
      },
      {
        label: 'v26.0.x',
        value: 'https://releases.rancher.com/install-docker/26.0.sh'
      },
      {
        label: 'v25.0.x',
        value: 'https://releases.rancher.com/install-docker/25.0.sh'
      },
      {
        label: 'v24.0.x',
        value: 'https://releases.rancher.com/install-docker/24.0.sh'
      },
      {
        label: 'v23.0.x',
        value: 'https://releases.rancher.com/install-docker/23.0.sh'
      },
      {
        label: 'v20.10.x',
        value: 'https://releases.rancher.com/install-docker/20.10.sh'
      },
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

    // Ensure the engine version is formatted in the same way as the label (currently 'v${VERSION}.x')
    const defaultEngineVersionLabel = get(this, 'intl').t('formEngineOpts.engineInstallUrl.version', { version: defaultEngineVersion });

    // Remove default engine version if it is already there (in case default is set to one of the options above)
    out = out.filter((opt) => opt.label !== defaultEngineVersionLabel);

    // Add the default at the start of the list
    out.unshift(defaultEngineVersionObj);

    return out;
  }),

});
