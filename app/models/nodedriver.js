import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export const BUILT_IN_UI = ['amazonec2','digitalocean', 'azure', 'exoscale','packet','rackspace','vmwarevsphere','aliyunecs'];
export const BUILT_IN_ICON_ONLY = ['openstack'];

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

export default Resource.extend({
  type: 'nodeDriver',
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
      get(this,'modalService').toggleModal('modal-edit-driver', this);
    },
  },

  catalogTemplateIcon: computed('externalId', function() {
    let parsedExtId = parseExternalId(get(this,'externalId')) || null;

    if (!parsedExtId) {
      return null;
    }

    if (get(this,'catalog').getTemplateFromCache(parsedExtId.templateId)) {
      return get(this,'catalog').getTemplateFromCache(parsedExtId.templateId).get('links.icon');
    } else {
      return `${get(this,'app.baseAssets')}assets/images/providers/generic-driver.svg`;
    }

  }),

  displayName: computed('name', 'intl.locale', function() {
    const intl = get(this,'intl');
    const name = get(this, 'name');
    const key = `nodeDriver.displayName.${name}`;

    if ( name && intl.exists(key) ) {
      return intl.t(key);
    } else if ( name ) {
      return name;
    } else {
      return '(' + get(this, 'id') + ')';
    }
  }),

  displayIcon: computed('name', function() {
    let name = get(this,'name');

    if ( get(this,'hasBuiltinUi') ) {
      return name;
    } else {
      return 'generic';
    }
  }),

  displayUrl: computed('url', function() {
    return displayUrl(get(this,'url'));
  }),

  displayChecksum: computed('checksum', function() {
    return get(this,'checksum').substring(0, 8);
  }),

  displayUiUrl: computed('uiUrl', function() {
    return displayUrl(get(this,'uiUrl'));
  }),

  hasBuiltinUi: computed('name', function() {
    return BUILT_IN_UI.indexOf(get(this,'name')) >= 0;
  }),

  hasBuiltinIconOnly: computed('name', function() {
    return BUILT_IN_ICON_ONLY.indexOf(get(this,'name')) >= 0;
  }),

  isCustom: computed('builtin','externalId', function() {
    return !get(this,'builtin') && !get(this,'externalId');
  }),

  hasUi: computed('hasBuiltinUi', function() {
    return get(this,'hasBuiltinUi') || !!get(this,'uiUrl');
  }),

  newExternalId: computed('isSystem','selectedTemplateModel.id', function() {
    var externalId = C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + get(this,'selectedTemplateModel.id');
    return externalId;
  }),

  availableActions: computed('links.{update,remove}','actionLinks.{activate,deactivate}','builtin', function() {
    let a = get(this,'actionLinks');
    let l = get(this,'links');
    let builtin = !!get(this,'builtin');

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
  }),

  externalIdInfo: computed('externalId', function() {
    return parseExternalId(get(this,'externalId'));
  }),
});
