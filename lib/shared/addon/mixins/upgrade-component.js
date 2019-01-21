import { once } from '@ember/runloop';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import Semver from 'semver';

const NONE       = 'none',
  LOADING    = 'loading',
  CURRENT    = 'current',
  AVAILABLE  = 'available',
  REQUIRED   = 'required',
  INPROGRESS = 'inprogress',
  UPGRADED   = 'upgraded',
  NOTFOUND   = 'notfound',
  ERROR      = 'error';

const INPROGRESS_STATES = [
  'upgrading',
  'canceled-upgrade',
  'canceling-rollback',
  'canceling-upgrade',
  'finishing-upgrade',
  'rolling-back',
];

export default Mixin.create({
  model:         null,
  upgradeOnly:   true,

  intl:          service(),
  catalog:       service(),
  router:        service(),
  growl:         service(),

  upgradeInfo:   null,
  upgradeStatus: null,
  latestVersion: null,
  launchRoute:   'catalog-tab.launch',

  init() {
    this._super(...arguments);
    this.updateStatus();
  },

  color: computed('upgradeStatus', function() {
    switch ( get(this, 'upgradeStatus') ) {
    case NONE:
      return 'none';
    case CURRENT:
    case LOADING:
      return 'bg-default';
    case NOTFOUND:
    case ERROR:
    case INPROGRESS:
      return 'bg-disabled';
    case REQUIRED:
      return 'bg-error';
    case AVAILABLE:
    case UPGRADED:
      return 'bg-warning';
    }
  }),

  currentVersion: computed('model.externalIdInfo.{version}', 'model.externalId', function() {
    let text = get(this, 'intl').findTranslationByKey('upgradeBtn.version.current');
    let version = get(this, 'model.externalIdInfo.version');

    if (typeof version === 'string' || typeof version === 'number') {
      return `${ text }: ${ get(this, 'upgradeInfo.version') }`;
    } else {
      return null;
    }
  }),

  externalIdChanged: observer('model.{externalId,state}', function() {
    once(() => {
      this.updateStatus();
    });
  }),

  doUpgrade() {
    let status = get(this, 'upgradeStatus');

    if ( [REQUIRED, AVAILABLE, CURRENT].indexOf(status) >= 0 ) {
      let templateId = get(this, 'model.externalIdInfo.templateId');
      let versionId  = get(this, 'latestVersion');
      let catalogId  = get(this, 'model.externalIdInfo.catalog');

      get(this, 'router').transitionTo(this.launchRoute, templateId, {
        queryParams: {
          upgrade:     versionId,
          catalog:     catalogId,
          namespaceId: get(this, 'model.targetNamespace'),
          appId:       get(this, 'model.id'),
        }
      });
    } else if ( status === UPGRADED ) {
      get(this, 'model').send('finishUpgrade');
    }
  },

  updateStatus() {
    let state           = get(this, 'model.state');
    let info            = get(this, 'model.externalIdInfo');
    let catalogTemplate = get(this, 'model.catalogTemplate');
    let upgradeVersions = {};
    let allVersions     = {};

    if ( state === 'upgraded' ) {
      set(this, 'upgradeStatus', UPGRADED);

      return;
    }

    if ( INPROGRESS_STATES.indexOf(state) >= 0 ) {
      set(this, 'upgradeStatus', INPROGRESS);

      return;
    }

    if ( info && C.EXTERNAL_ID.UPGRADEABLE.indexOf(info.kind) >= 0 ) {
      set(this, 'upgradeStatus', LOADING);
    } else {
      set(this, 'upgradeStatus', NONE);
    }

    if ( catalogTemplate ) {
      upgradeVersions = parseUpgradeVersions(
        get(catalogTemplate, 'versionLinks'),
        get(info, 'version'),
        get(catalogTemplate, 'name'),
        get(this, 'growl')
      );
      get(catalogTemplate, 'versionLinks');
    }

    if (Object.keys(upgradeVersions).length >= 1) {
      setProperties(this, {
        upgradeStatus: AVAILABLE,
        latestVersion: Object.keys(upgradeVersions)[Object.keys(upgradeVersions).length - 1],
      });
    } else {
      setProperties(this, {
        upgradeStatus: CURRENT,
        latestVersion: get(info, 'version'),
      });
    }

    // console.log('upgradeVersions', upgradeVersions);

    function parseUpgradeVersions(allVersions, currentVersion, templateName, growl) {
      let keys = Object.keys(allVersions);
      let upgrades = {};

      keys.forEach( (k) => {
        try {
          let gt = Semver.gt(Semver.coerce(k), Semver.coerce(currentVersion));

          if (gt) {
            upgrades[k] = allVersions[k];
          }
        } catch (err) {
          growl.fromError(`Invalid catalog app version in ${ templateName }`, err);
        }
      });

      return upgrades;
    }

    setProperties(this, {
      allVersions,
      upgradeVersions
    });

    return;
  },

});
