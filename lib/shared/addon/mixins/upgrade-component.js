import { get, computed, observer, setProperties } from '@ember/object';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import Semver from 'semver';
import { on } from '@ember/object/evented';

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
    let text = get(this, 'intl').t('upgradeBtn.version.current');
    let version = get(this, 'model.externalIdInfo.version');

    if (typeof version === 'string' || typeof version === 'number') {
      return `${ text }: ${ get(this, 'upgradeInfo.version') }`;
    } else {
      return null;
    }
  }),

  externalIdChanged: on('init', observer('model.externalIdInfo.[]', 'model.catalogTemplate', function() {
    this.updateStatus();
  })),

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
    if ( !this.model ) {
      return;
    }
    const {
      state,
      externalIdInfo: info,
      catalogTemplate,
    } = this.model;
    let { upgradeStatus, latestVersion } = this;
    let upgradeVersions = {};
    let allVersions     = {};

    if ( !info ) {
      upgradeStatus = NOTFOUND;
    }

    if ( state === 'upgraded' ) {
      upgradeStatus = UPGRADED;
    }

    if ( INPROGRESS_STATES.indexOf(state) >= 0 ) {
      upgradeStatus = INPROGRESS;
    }

    if ( info && C.EXTERNAL_ID.UPGRADEABLE.indexOf(info.kind) >= 0 ) {
      upgradeStatus = LOADING;
    } else {
      upgradeStatus = NONE;
    }

    if ( catalogTemplate ) {
      upgradeVersions = parseUpgradeVersions(
        get(catalogTemplate, 'versionLinks'),
        get(info, 'version'),
        get(catalogTemplate, 'name'),
        get(this, 'growl')
      );

      if (Object.keys(upgradeVersions).length >= 1) {
        upgradeStatus = AVAILABLE;
        latestVersion = Object.keys(upgradeVersions)[Object.keys(upgradeVersions).length - 1];
      } else {
        upgradeStatus = CURRENT;
        latestVersion = get(info, 'version');
      }
    } else {
      upgradeStatus = NOTFOUND;
      latestVersion = get(info, 'version');
    }


    // console.log('upgradeVersions', upgradeVersions);

    function parseUpgradeVersions(allVersions, currentVersion, templateName, growl) {
      let keys = Object.keys(allVersions);
      let upgrades = {};

      keys.forEach( (k) => {
        try {
          const v = Semver.coerce(k)
          const cv = Semver.coerce(currentVersion)

          if ( v !== null && cv !== null ) {
            let gt = Semver.gt(v, cv);

            if (gt) {
              upgrades[k] = allVersions[k];
            }
          }
        } catch (err) {
          growl.fromError(`Invalid catalog app version in ${ templateName }`, err);
        }
      });

      return upgrades;
    }

    setProperties(this, {
      allVersions,
      upgradeVersions,
      upgradeStatus,
      latestVersion
    });

    return;
  },

});
