import Ember from 'ember';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

const NONE = 'none',
      LOADING = 'loading',
      CURRENT = 'current',
      AVAILABLE = 'available',
      ERROR = 'error';

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var uuid = task.uuid;
  var obj = task.obj;

  ajaxPromise({url: '/v1-catalog/upgradeinfo/'+ uuid, dataType: 'json'},true).then((upgradeInfo) => {
    obj.set('upgradeInfo', upgradeInfo);
    if ( upgradeInfo && upgradeInfo.newVersionLinks && Object.keys(upgradeInfo.newVersionLinks).length )
    {
      obj.set('upgradeStatus', AVAILABLE);
    }
    else
    {
      obj.set('upgradeStatus', CURRENT);
    }
  }).catch((/*err*/) => {
    obj.set('upgradeStatus', ERROR);
  }).finally(() => {
    cb();
  });
}

export default Ember.Component.extend({
  environmentResource: null,
  upgradeStatus: null,

  tagName: 'button',
  classNames: ['btn','btn-sm'],
  classNameBindings: ['btnClass'],

  upgradeInfo: null,

  didInitAttrs() {
    var uuid = this.get('environmentResource.externalId');
    if ( uuid )
    {
      this.set('upgradeStatus', LOADING);
      queue.push({uuid: uuid, obj: this});
    }
    else
    {
      this.set('upgradeStatus', NONE);
    }
  },

  click: function() {
    var upgradeInfo = this.get('upgradeInfo');
    upgradeInfo.versionLinks = upgradeInfo.newVersionLinks;

    if ( this.get('upgradeStatus') === AVAILABLE )
    {
      this.get('application').setProperties({
        launchCatalog: true,
        originalModel: upgradeInfo,
        environmentResource: this.get('environmentResource'),
      });
    }
  },

  btnClass: function() {
    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return 'hide';
      case LOADING:
      case CURRENT:
      case ERROR:
        return 'btn-link btn-disabled';
      case AVAILABLE:
        return 'btn-warning';
    }
  }.property('upgradeStatus'),

  btnLabel: function() {
    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return '';
      case LOADING:
        return 'Checking Upgrades...';
      case CURRENT:
        return 'Up to date';
      case AVAILABLE:
        return 'Upgrade Available';
      default:
        return 'Error checking upgrades';
    }
  }.property('upgradeStatus'),
});
