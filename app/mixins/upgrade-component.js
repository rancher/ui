import Ember from 'ember';
import C from 'ui/utils/constants';

const NONE       = 'none',
      LOADING    = 'loading',
      CURRENT    = 'current',
      AVAILABLE  = 'available',
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

  let deps = {
    upgradeInfo: obj.get('catalog').fetchTemplate(task.id, true)
  };

  if ( task.upgradeOnly === false ) {
    deps.fullInfo = obj.get('catalog').fetchTemplate(task.templateId, false);
  }

  Ember.RSVP.hash(deps).then((hash) => {
    if ( this.isDestroyed || this.isDestroying ) {
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

    obj.setProperties({
      upgradeStatus: Object.keys(upgradeVersions).length ? AVAILABLE : CURRENT,
      upgradeVersions: upgradeVersions,
      allVersions: allVersions,
    });
  }).catch((err) => {
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
        return 'btn-info';
      case LOADING:
      case NOTFOUND:
      case ERROR:
      case INPROGRESS:
        return 'btn-disabled';
      case AVAILABLE:
      case UPGRADED:
        return 'btn-warning';
    }
  }),

  currentVersion: Ember.computed('upgradeInfo','model.externalId', function() {
    let text = this.get('intl').findTranslationByKey('upgradeBtn.version.current');
    return `${text}: ${this.get('upgradeInfo.version')}`;
  }),

  doUpgrade() {
    let upgradeInfo = this.get('upgradeInfo');
    let status = this.get('upgradeStatus');

    if ( [AVAILABLE,CURRENT].indexOf(status) >= 0 )
    {
      // Hackery, but no good way to get the template from upgradeInfo
      var tpl = upgradeInfo.id;

      this.get('application').transitionToRoute('catalog-tab.launch', tpl, {queryParams: {
        stackId: this.get('model.id'),
        upgrade: this.get('upgradeInfo.id'),
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
    if ( state === 'upgraded' )
    {
      this.set('upgradeStatus', UPGRADED);
      return;
    }

    if ( INPROGRESS_STATES.indexOf(state) >= 0 )
    {
      this.set('upgradeStatus', INPROGRESS);
      return;
    }

    let info = this.get('model.externalIdInfo');
    if ( info && C.EXTERNAL_ID.UPGRADEABLE.indexOf(info.kind) >= 0 )
    {
      this.set('upgradeStatus', LOADING);

      queue.push({
        obj: this,
        id: info.id,
        templateId: info.templateId,
        upgradeOnly: upgradeOnly,
      });
    }
    else
    {
      this.set('upgradeStatus', NONE);
    }
  },

  externalIdChanged: function() {
    Ember.run.once(this, 'updateStatus');
  }.observes('model.{externalId,state}'),
});
