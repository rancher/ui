import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import { set, get, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import UpgradeComponent from 'shared/mixins/upgrade-component';

const PREFIX = 'cattle-global-data';
const AVAILABLE  = 'available';

export default Mixin.create(UpgradeComponent, {
  scope:       service(),
  catalog:     service(),
  globalStore: service(),

  apps:             null,
  latestVersion:    null,
  templateId:       null,

  checkUpdateStatus: on('init', observer('apps', function() {
    get(this, 'catalog').fetchTemplate(`${ PREFIX }:${ get(this, 'templateId') }`).then(() => {
      const toUpgrade = [];

      get(this, 'apps').forEach((app) => {
        set(this, 'model', app);
        this.updateStatus();
        if ( AVAILABLE ===  get(this, 'upgradeStatus') ) {
          toUpgrade.push(app);
        }
      });

      set(this, 'toUpgrade', toUpgrade);
    });
  })),

  upgradeAvailable: computed('toUpgrade', function() {
    const toUpgrade = get(this, 'toUpgrade') || [];

    return get(toUpgrade, 'length') > 0;
  }),

  actions: {
    upgrade() {
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
              .replace(`version=${ get(externalInfo, 'version') }`, `version=${ get(this, 'latestVersion') }`)
          }
        }));
      });
      set(this, 'toUpgrade', []);

      return PromiseAll(requests);
    }
  },
});
