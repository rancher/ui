import Ember from 'ember';
import C from 'ui/utils/constants';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

const NONE = 'none',
      LOADING = 'loading',
      CURRENT = 'current',
      AVAILABLE = 'available',
      ERROR = 'error';

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var obj = task.obj;

  ajaxPromise({url: task.url, dataType: 'json'},true).then((upgradeInfo) => {
    upgradeInfo.id = task.id;
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

    if ( this.get('upgradeStatus') === AVAILABLE )
    {
      // Hackery, but no good way to get the template from upgradeInfo
      var tpl = '_upgrade';
      var key = Object.keys(upgradeInfo.newVersionLinks)[0];
      var match = upgradeInfo.newVersionLinks[key].match(/.*\/templates\/(.*)\/([^\/]+)$/);
      if ( match )
      {
        tpl = match[1];
      }

      this.get('application').transitionToRoute('applications-tab.catalog.launch', tpl, {queryParams: {
        environmentId: this.get('environmentResource.id'),
        upgrade: this.get('upgradeInfo.id'),
      }});
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
    var info = this.get('environmentResource.externalIdInfo');
    if ( info.kind === C.EXTERNALID.KIND_CATALOG )
    {
      this.set('upgradeStatus', LOADING);
      queue.push({
        id: info.id,
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
