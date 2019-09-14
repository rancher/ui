import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import {
  set, get, computed, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import UpgradeComponent from 'shared/mixins/upgrade-component';
import { compare as compareVersion } from 'ui/utils/parse-version';

const PREFIX = 'cattle-global-data';
const AVAILABLE  = 'available';

export default Mixin.create(UpgradeComponent, {
  scope:       service(),
  catalog:     service(),
  globalStore: service(),

  apps:             null,
  latestVersion:    null,
  templateId:       null,

  templateVersion:   null,

  checkUpdateStatus: on('init', observer('apps', function() {
    get(this, 'catalog').fetchTemplate(`${ PREFIX }:${ get(this, 'templateId') }`).then((template) => {
      const toUpgrade = [];

      (get(this, 'apps') || []).forEach((app) => {
        set(this, 'model', app);
        this.updateStatus();
        if ( AVAILABLE ===  get(this, 'upgradeStatus') ) {
          toUpgrade.push(app);
        }
      });

      set(this, 'toUpgrade', toUpgrade);

      if (template.labels) {
        set(this, 'templateLables', template.labels)
      }

      this.initAvailableVersions(template);
    });
  })),

  appVersion: computed('templateVersion', 'templateName', function() {
    const { templateVersion, templateName } = this

    return `catalog://?catalog=system-library&template=${ templateName }&version=${ templateVersion }`
  }),

  initAvailableVersions(template) {
    const apps = get(this, 'apps') || [];
    const links = get(template, 'versionLinks');

    const versions = Object.keys(links).filter((key) => !!links[key])
      .map((key) => ({
        label: key,
        value: key,
      })).sort((a, b) => compareVersion(a.value, b.value));

    if ( get(versions, 'length') === 0 ) {
      set(this, 'availableVersions', []);

      return;
    }

    if ( get(apps, 'length') ) {
      const currentVersion = get(apps, 'firstObject.externalIdInfo.version');
      const availableVersions = versions.filter((v) => compareVersion(v.value, currentVersion) > 0);

      availableVersions.unshift({
        value: currentVersion,
        label: currentVersion
      });
      setProperties(this, {
        availableVersions,
        templateVersion:   currentVersion
      });
    } else {
      setProperties(this, {
        availableVersions: versions,
        templateVersion:   get(versions, 'lastObject.value')
      });
    }
  },

  upgradeAvailable: computed('toUpgrade', function() {
    const toUpgrade = get(this, 'toUpgrade') || [];

    return get(toUpgrade, 'length') > 0;
  }),

  actions: {
    upgrade() {
      const currentVersion = get(this, 'apps.firstObject.externalIdInfo.version');
      const templateVersion = get(this, 'templateVersion');

      if ( !templateVersion || !currentVersion || templateVersion === currentVersion ) {
        return;
      }

      set(this, 'availableVersions', get(this, 'availableVersions').slice(get(this, 'availableVersions').findIndex((v) => v.value === templateVersion)));

      const requests = [];
      const apps = get(this, 'toUpgrade') || [];

      apps.forEach((app) => {
        const externalInfo = get(app, 'externalIdInfo');

        requests.push(get(this, 'globalStore').rawRequest({
          url:    `/v3/project/${ get(app, 'projectId') }/apps/${ get(app, 'id') }`,
          method: 'PUT',
          data:   {
            targetNamespace: get(app, 'targetNamespace'),
            externalId:      get(app, 'externalId')
              .replace(`version=${ get(externalInfo, 'version') }`, `version=${ templateVersion }`)
          }
        }));
      });
      set(this, 'toUpgrade', []);

      return PromiseAll(requests);
    }
  },
});
