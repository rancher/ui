import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export const BUILT_IN_UI = ['amazonec2', 'digitalocean', 'azure', 'exoscale', 'harvester', 'packet', 'pnap', 'rackspace', 'vmwarevsphere', 'aliyunecs', 'oci'];
export const BUILT_IN_ICON_ONLY = ['openstack', 'otc'];

function displayUrl(url) {
  url = url || '';
  let parts = url.split('/');
  let out    = null;

  if ( parts.length < 2 ) {
    return url;
  }

  if (url.indexOf('github.com') >= 0) {
    out = `.../${ parts[parts.length - 2] }/${ parts[parts.length - 1] }`;
  } else {
    out = url;
  }

  return out;
}

export default Resource.extend({
  modalService:        service('modal'),
  catalog:             service(),
  intl:                service(),
  type:                'nodeDriver',
  canRemove:    computed.equal('state', 'inactive'),

  catalogTemplateIcon: computed('app.baseAssets', 'externalId', function() {
    let parsedExtId = parseExternalId(this.externalId) || null;

    if (!parsedExtId) {
      return null;
    }

    if (this.catalog.getTemplateFromCache(parsedExtId.templateId)) {
      return this.catalog.getTemplateFromCache(parsedExtId.templateId)
        .get('links.icon');
    } else {
      return `${ get(this, 'app.baseAssets') }assets/images/providers/generic-driver.svg`;
    }
  }),

  displayName: computed('id', 'intl.locale', 'name', function() {
    const intl = this.intl;
    const name = this.name;
    const key = `nodeDriver.displayName.${ name }`;

    if ( name && intl.exists(key) ) {
      return intl.t(key);
    } else if ( name ) {
      return name.capitalize();
    } else {
      return `(${  this.id  })`;
    }
  }),

  displayIcon: computed('hasBuiltinUi', 'name', function() {
    let name = this.name;

    if ( this.hasBuiltinUi ) {
      return name;
    } else {
      return 'generic';
    }
  }),

  displayUrl: computed('url', function() {
    return displayUrl(this.url);
  }),

  displayChecksum: computed('checksum', function() {
    return this.checksum.substring(0, 8);
  }),

  displayUiUrl: computed('uiUrl', function() {
    return displayUrl(this.uiUrl);
  }),

  hasBuiltinUi: computed('name', function() {
    return BUILT_IN_UI.indexOf(this.name) >= 0;
  }),

  hasBuiltinIconOnly: computed('name', function() {
    return BUILT_IN_ICON_ONLY.indexOf(this.name) >= 0;
  }),

  isCustom: computed('builtin', 'externalId', function() {
    return !this.builtin && !this.externalId;
  }),

  hasUi: computed('hasBuiltinUi', 'uiUrl', function() {
    return this.hasBuiltinUi || !!this.uiUrl;
  }),

  newExternalId: computed('isSystem', 'selectedTemplateModel.id', function() {
    var externalId = C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + get(this, 'selectedTemplateModel.id');

    return externalId;
  }),

  canEdit: computed('links.update', 'builtin', function() {
    return !!get(this, 'links.update') && !this.builtin;
  }),

  availableActions: computed('actionLinks.{activate,deactivate}', 'state', function() {
    let a = this.actionLinks || {};

    return [
      {
        label:    'action.activate',
        icon:     'icon icon-play',
        action:   'activate',
        enabled:  !!a.activate && this.state === 'inactive',
        bulkable: true
      },
      {
        label:     'action.deactivate',
        icon:      'icon icon-pause',
        action:    'promptDeactivate',
        enabled:   !!a.deactivate && this.state === 'active',
        bulkable:  true,
        altAction: 'deactivate',
      },
    ];
  }),

  externalIdInfo: computed('externalId', function() {
    return parseExternalId(this.externalId);
  }),

  actions: {
    activate() {
      return this.doAction('activate');
    },

    deactivate() {
      return this.doAction('deactivate');
    },

    promptDeactivate() {
      this.modalService.toggleModal('modal-confirm-deactivate', {
        originalModel: this,
        action:        'deactivate'
      });
    },

    edit() {
      this.modalService.toggleModal('modal-edit-driver', this);
    },
  },

});
