import Ember from 'ember';
import C from 'ui/utils/constants';

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

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var obj = task.obj;
  console.log('Upgrade info', obj.model.id);

  let deps = {
    upgradeInfo: obj.get('catalog').fetchTemplate(task.id, true)
  };

  if ( task.upgradeOnly === false ) {
    deps.fullInfo = obj.get('catalog').fetchTemplate(task.templateId, false);
  }

  Ember.RSVP.hash(deps).then((hash) => {
    if ( obj.isDestroyed || obj.isDestroying ) {
      return;
    }

    let upgradeInfo = hash.upgradeInfo;
    let fullInfo = hash.fullInfo;

    if ( !upgradeInfo ) {
      obj.set('upgradeStatus', CURRENT);
      return;
    }

    upgradeInfo.id = task.id;
    obj.set('upgradeInfo', upgradeInfo);

    let upgradeVersions={}, allVersions={};
    if ( upgradeInfo && upgradeInfo.upgradeVersionLinks ) {
      let list = upgradeInfo.upgradeVersionLinks;
      Object.keys(list).forEach((key) => {
        if ( list[key] ) {
          upgradeVersions[key] = list[key];
        }
      });
    }

    if ( fullInfo && fullInfo.versionLinks ) {
      let list = fullInfo.versionLinks;
      Object.keys(list).forEach((key) => {
        if ( list[key] ) {
          allVersions[key] = list[key];
        }
      });
    }

    if (upgradeVersions && obj.get('upgradeStatus') !== UPGRADED) {
      let status = CURRENT;
      if ( Object.keys(upgradeVersions).length ) {
        if ( upgradeInfo.catalogId === C.CATALOG.LIBRARY_KEY && upgradeInfo.templateBase === C.EXTERNAL_ID.KIND_INFRA ) {
          status = REQUIRED;
        } else {
          status = AVAILABLE;
        }
      }

      obj.setProperties({
        upgradeStatus: status,
        upgradeVersions: upgradeVersions,
        allVersions: allVersions,
      });
    } else { // we're in upgraded status and have not finished but still need a verison for tooltip
      obj.setProperties({
        allVersions: allVersions,
      });
    }
  }).catch((err) => {
    if ( obj.isDestroyed || obj.isDestroying ) {
      return;
    }

    if ( err.status === 404 )
    {
      obj.set('upgradeStatus', NOTFOUND);
    }
    else
    {
      obj.set('upgradeStatus', ERROR);
    }
  }).finally(() => {
    cb();
  });
}

export default Ember.Mixin.create({
  model               : null,
  upgradeOnly         : true,

  intl                : Ember.inject.service(),
  catalog             : Ember.inject.service(),
  userStore           : Ember.inject.service('user-store'),

  upgradeInfo         : null,
  upgradeStatus       : null,

  init() {
    this._super(...arguments);
    this.updateStatus();
  },

  color: Ember.computed('upgradeStatus', function() {
    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return 'hide';
      case CURRENT:
      case LOADING:
        return 'bg-transparent';
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

  currentVersion: Ember.computed('upgradeInfo','model.externalId', function() {
    let text = this.get('intl').findTranslationByKey('upgradeBtn.version.current');
    let version = this.get('upgradeInfo.version');
    if (typeof version === 'string' || typeof version === 'number') {
      return `${text}: ${this.get('upgradeInfo.version')}`;
    } else {
      return null;
    }
  }),

  doUpgrade() {
    let status = this.get('upgradeStatus');

    if ( [REQUIRED,AVAILABLE,CURRENT].indexOf(status) >= 0 )
    {
      let templateId = this.get('model.externalIdInfo.templateId');
      let versionId = this.get('upgradeInfo.id');
      this.get('application').transitionToRoute('catalog-tab.launch', templateId, {queryParams: {
        stackId: this.get('model.id'),
        upgrade: versionId
      }});
    }
    else if ( status === UPGRADED )
    {
      this.get('model').send('finishUpgrade');
    }
  },

  updateStatus() {
    let upgradeOnly = this.get('upgradedOnly') === true;
    let state = this.get('model.state');
    let info = this.get('model.externalIdInfo');
    var queueUpgradeStatus = () => {
      queue.push({
        obj: this,
        id: info.id,
        templateId: info.templateId,
        upgradeOnly: upgradeOnly,
      });
    };

    if ( state === 'upgraded' )
    {
      this.set('upgradeStatus', UPGRADED);
      queueUpgradeStatus();
      return;
    }

    if ( INPROGRESS_STATES.indexOf(state) >= 0 )
    {
      this.set('upgradeStatus', INPROGRESS);
      return;
    }

    if ( info && C.EXTERNAL_ID.UPGRADEABLE.indexOf(info.kind) >= 0 )
    {
      this.set('upgradeStatus', LOADING);
      queueUpgradeStatus();
    }
    else
    {
      this.set('upgradeStatus', NONE);
    }

  },

  externalIdChanged: function() {
    Ember.run.once(() => {
      this.updateStatus();
    });
  }.observes('model.{externalId,state}'),
});
