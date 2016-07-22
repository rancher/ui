import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

const NONE       = 'none',
      LOADING    = 'loading',
      CURRENT    = 'current',
      AVAILABLE  = 'available',
      INPROGRESS = 'inprogress',
      UPGRADED   = 'upgraded',
      NOTFOUND   = 'notfound',
      ERROR      = 'error';

const inprogressStates = [
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
  environmentResource : null,
  upgradeStatus       : null,
  intl                : Ember.inject.service(),
  settings            : Ember.inject.service(),

  tagName             : 'button',
  classNames          : ['btn','btn-sm'],
  classNameBindings   : ['btnClass'],

  upgradeInfo         : null,

  init() {
    this._super(...arguments);

    this.updateStatus();
  },

  click: function() {
    let upgradeInfo = this.get('upgradeInfo');
    let status = this.get('upgradeStatus');

    if ( status === AVAILABLE )
    {
      // Hackery, but no good way to get the template from upgradeInfo
      var tpl = upgradeInfo.id;

      this.get('application').transitionToRoute('catalog-tab.launch', tpl, {queryParams: {
        environmentId: this.get('environmentResource.id'),
        upgrade: this.get('upgradeInfo.id'),
      }});
    }
    else if ( status === UPGRADED )
    {
      this.get('environmentResource').send('finishUpgrade');
    }
  },

  btnClass: function() {
    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return 'hide';
      case LOADING:
      case CURRENT:
      case NOTFOUND:
      case ERROR:
      case INPROGRESS:
        return 'btn-disabled';
      case AVAILABLE:
      case UPGRADED:
        return 'btn-warning';
    }
  }.property('upgradeStatus'),

  updateStatus() {
    let state = this.get('environmentResource.state');
    if ( state === 'upgraded' )
    {
      this.set('upgradeStatus', UPGRADED);
      return;
    }

    if ( inprogressStates.indexOf(state) >= 0 )
    {
      this.set('upgradeStatus', INPROGRESS);
      return;
    }

    let info = this.get('environmentResource.externalIdInfo');
    if ( info && C.EXTERNAL_ID.UPGRADEABLE.indexOf(info.kind) >= 0 )
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

  externalIdChanged: function() {
    this.updateStatus();
  }.observes('environmentResource.{externalId,state}'),
});
