import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import { parseExternalId } from 'ui/utils/parse-externalid';

const NONE = 'none',
      LOADING = 'loading',
      CURRENT = 'current',
      AVAILABLE = 'available',
      ERROR = 'error';

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var obj = task.obj;

  ajaxPromise({url: task.url, dataType: 'json'},true).then((upgradeInfo) => {
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
    this.updateStatus();
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

  updateStatus() {
    var info = parseExternalId(this.get('environmentResource.externalId'));

    if ( info && info.kind === C.EXTERNALID.KIND_CATALOG )
    {
      this.set('upgradeStatus', LOADING);
      queue.push({
        url: this.get('app.catalogEndpoint')+'/upgradeinfo/'+ info.id,
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
  }.property('environmentResource.externalId'),
});
