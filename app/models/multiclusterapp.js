import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';

const {
  HELM_VERSION_2:       helmV2,
  HELM_VERSION_3:       helmV3,
  HELM_VERSION_3_SHORT: helmV3Short,
} = C.CATALOG;

const MultiClusterApp = Resource.extend({
  catalog:         service(),
  router:          service(),
  clusterStore:    service(),
  globalStore:     service(),

  canEdit: false,

  templateVersion: reference('templateVersionId', 'templateversion', 'globalStore'),
  catalogTemplate: reference('templateId', 'template', 'globalStore'),

  isHelm3: computed('helmVersion', function() {
    const { helmVersion = helmV2 } = this;

    if (helmVersion === helmV3 || helmVersion === helmV3Short) {
      return true;
    }

    return false;
  }),

  externalIdInfo: computed('templateVersion.externalId', function() {
    return parseHelmExternalId(get(this, 'templateVersion.externalId'));
  }),

  templateId: computed('externalIdInfo.templateId', function() {
    return get(this, 'externalIdInfo.templateId');
  }),

  canUpgrade: computed('actionLinks.upgrade', 'catalogTemplate', 'links', 'templateVersion', function() {
    const l = this.links || {};

    return !!l.update && !isEmpty(this.catalogTemplate);
  }),

  canClone: computed('catalogTemplate', 'templateVersion', function() {
    return !isEmpty(this.catalogTemplate);
  }),

  canRollback: computed('actionLinks', 'catalogTemplate', 'templateVersion', function() {
    return !isEmpty(this.catalogTemplate) && !!( this.actionLinks || {} ).rollback;
  }),

  availableActions: computed('actionLinks.rollback', 'links.update', 'canUpgrade', 'canRollback', function() {
    return [
      {
        label:   'action.upgrade',
        icon:    'icon icon-edit',
        action:  'upgrade',
        enabled: this.canUpgrade
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: this.canRollback
      }
    ];
  }),

  actions: {
    upgrade() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');
      const vKeys         = Object.keys(get(this, 'catalogTemplate.versionLinks'));
      const latestVersion =  vKeys[vKeys.length - 1];

      this.router.transitionTo('global-admin.multi-cluster-apps.catalog.launch', templateId, {
        queryParams: {
          appId:       this.id,
          catalog:     catalogId,
          upgrade:     latestVersion,
        }
      });
    },

    rollback() {
      this.modalService.toggleModal('modal-rollback-mc-app', {
        originalModel: this,
        revisionsLink: this.links.revisions,
      });
    },

    clone() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');

      this.router.transitionTo('global-admin.multi-cluster-apps.catalog.launch', templateId, {
        queryParams: {
          appId:       this.id,
          catalog:     catalogId,
          clone:       true
        }
      });
    }

  },

})

export default MultiClusterApp;
