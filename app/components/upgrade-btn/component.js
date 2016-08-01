import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

const NONE = 'none',
      LOADING = 'loading',
      CURRENT = 'current',
      AVAILABLE = 'available',
      NOTFOUND = 'notfound',
      ERROR = 'error';

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var obj = task.obj;

  obj.get('userStore').request({url: task.url}).then((upgradeInfo) => {
    if ( obj._state !== 'destroying' )
    {
      upgradeInfo.id = task.id;
      obj.set('upgradeInfo', upgradeInfo);
      if ( upgradeInfo && upgradeInfo.upgradeVersionLinks )
      {
        // Filter out keys with empty values because of catalog bug (rancher/rancher#5494)
        let available = Object.keys(upgradeInfo.upgradeVersionLinks).filter((key) => {
          return !!upgradeInfo.upgradeVersionLinks[key];
        });


        obj.set('upgradeStatus', available.length ? AVAILABLE : CURRENT);
      }
      else
      {
        obj.set('upgradeStatus', CURRENT);
      }
    }
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

export default Ember.Component.extend({
  environmentResource: null,
  upgradeStatus: null,
  intl: Ember.inject.service(),
  settings: Ember.inject.service(),

  tagName: 'button',
  classNames: ['btn','btn-sm'],
  classNameBindings: ['btnClass'],

  upgradeInfo: null,

  didInitAttrs() {
    this.updateStatus();
  },

  click: function() {
    var upgradeInfo = this.get('upgradeInfo');

    if ( this.get('upgradeStatus') === AVAILABLE && !this.get('isUpgradeState') )
    {
      // Hackery, but no good way to get the template from upgradeInfo
      var tpl = upgradeInfo.id;

      this.get('application').transitionToRoute('catalog-tab.launch', tpl, {queryParams: {
        environmentId: this.get('environmentResource.id'),
        upgrade: this.get('upgradeInfo.id'),
      }});
    }
  },

  btnClass: function() {
    if ( this.get('isUpgradeState') )
    {
      return 'btn-disabled';
    }

    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return 'hide';
      case LOADING:
      case CURRENT:
      case NOTFOUND:
      case ERROR:
        return 'btn-disabled';
      case AVAILABLE:
        return 'btn-warning';
    }
  }.property('upgradeStatus','isUpgradeState'),

  btnLabel: function() {
    let intl = this.get('intl');
    if ( this.get('isUpgradeState') )
    {
      return 'Upgrade in progress';
    }

    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return '';
      case LOADING:
        return intl.t('upgradeBtn.status.loading');
      case CURRENT:
        return intl.t('upgradeBtn.status.current');
      case AVAILABLE:
        return intl.t('upgradeBtn.status.available');
      case NOTFOUND:
        return intl.t('upgradeBtn.status.notfound');
      default:
        return intl.t('upgradeBtn.status.default');
    }
  }.property('upgradeStatus','isUpgradeState', 'intl._locale'),

  updateStatus() {
    var info = this.get('environmentResource.externalIdInfo');
    if ( info && C.EXTERNALID.UPGRADEABLE.indexOf(info.kind) >= 0 )
    {
      this.set('upgradeStatus', LOADING);

      var version = this.get('settings.rancherVersion');
      var url = this.get('app.catalogEndpoint')+'/templateversions/'+info.id;
      if ( version )
      {
        url = Util.addQueryParam(url, 'minimumRancherVersion_lte', version);
      }

      queue.push({
        id: info.id,
        url: url,
        obj: this
      });
    }
    else
    {
      this.set('upgradeStatus', NONE);
    }
  },

  isUpgradeState: function() {
    return [
      'uprading',
      'canceled-upgrade',
      'canceling-rollback',
      'canceling-upgrade',
      'finishing-upgrade',
      'rolling-back',
      'upgrading',
      'upgraded'
    ].indexOf(this.get('environmentResource.state')) >= 0;
  }.property('environmentResource.state'),

  externalIdChanged: function() {
    this.updateStatus();
  }.observes('environmentResource.externalId'),
});
