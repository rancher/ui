import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export const builtInUi = ['amazonec2','azure','digitalocean','exoscale','packet','rackspace','vmwarevsphere','aliyunecs'];

function displayUrl(url) {
  url = url||'';
  let parts = url.split('/');
  let out    = null;

  if ( parts.length < 2 )
  {
    return url;
  }

  if (url.indexOf('github.com') >= 0) {
    out = `.../${parts[parts.length-2]}/${parts[parts.length-1]}`;
  } else {
    out = url;
  }
  return out;
}

var machineDriver = Resource.extend(PolledResource, {
  type: 'machineDriver',
  modalService: service('modal'),
  catalog: service(),
  intl: service(),

  actions: {
    activate: function() {
      return this.doAction('activate');
    },

    deactivate: function() {
      return this.doAction('deactivate');
    },

    edit: function() {
      this.get('modalService').toggleModal('modal-edit-driver', this);
    },
  },

  catalogTemplateIcon: computed('externalId', function() {
    let parsedExtId = parseExternalId(this.get('externalId')) || null;

    if (!parsedExtId) {
      return null;
    }

    if (this.get('catalog').getTemplateFromCache(parsedExtId.templateId)) {
      return this.get('catalog').getTemplateFromCache(parsedExtId.templateId).get('links.icon');
    } else {
      return `${this.get('app.baseAssets')}assets/images/providers/generic-driver.svg`;
    }

  }),

  displayName: computed('displayIcon', 'intl.locale', function() {
    return this.get('intl').t('machine.driver.'+this.get('displayIcon'));
  }),

  displayIcon: computed('name', function() {
    let name = this.get('name');

    if ( this.get('hasBuiltinUi') ) {
      return name;
    } else {
      return 'generic';
    }
  }),

  displayUrl: function() {
    return displayUrl(this.get('url'));
  }.property('url'),

  displayChecksum: computed('checksum', function() {
    return this.get('checksum').substring(0, 8);
  }),

  displayUiUrl: function() {
    return displayUrl(this.get('uiUrl'));
  }.property('uiUrl'),

  hasBuiltinUi: function() {
    return builtInUi.indexOf(this.get('name')) >= 0;
  }.property('name'),

  isCustom: function() {
    return !this.get('builtin') && !this.get('externalId');
  }.property('builtin','externalId'),

  hasUi: function() {
    return this.get('hasBuiltinUi') || !!this.get('uiUrl');
  }.property('hasBuiltinUi'),

  newExternalId: function() {
    var externalId = C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + this.get('selectedTemplateModel.id');
    return externalId;
  }.property('isSystem','selectedTemplateModel.id'),

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');
    let builtin = !!this.get('builtin');

    return [
      { label: 'action.edit',        icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update && !builtin },
      { divider: true },
      { label: 'action.activate',    icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate, bulkable: true},
      { label: 'action.deactivate',  icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate, bulkable: true},
      { divider: true },
      { label: 'action.remove',      icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove && !builtin, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',   icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{activate,deactivate}','links.{update,remove}','builtin'),

  externalIdInfo: function() {
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),
});

machineDriver.reopenClass({
  // Drivers don't get pushed by /subscribe WS, so refresh more often
  pollTransitioningDelay: 2000,
  pollTransitioningInterval: 1000,
  pollTransitioningIntervalMax: 60000,
  pollTransitioningIntervalFactor: 1.5,
});

export default machineDriver;
