import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import { inject as service } from '@ember/service';

const MultiClusterApp = Resource.extend({
  catalog:         service(),
  router:          service(),
  clusterStore:    service(),
  globalStore:     service(),

  canEdit:         false,
  canClone:        true,

  templateVersion: reference('templateVersionId', 'templateVersion', 'globalStore'),
  catalogTemplate: reference('externalIdInfo.templateId', 'template', 'globalStore'),

  externalIdInfo: computed('templateVersion.externalId', function() {
    return parseHelmExternalId(get(this, 'templateVersion.externalId'));
  }),

  availableActions: computed('actionLinks.{rollback}', 'links.{update}', function() {
    const a = get(this, 'actionLinks') || {};
    const l = get(this, 'links') || {};

    var choices = [
      {
        label:   'action.upgrade',
        icon:    'icon icon-edit',
        action:  'upgrade',
        enabled: !!l.update
      },
      {
        label:   'action.rollback',
        icon:    'icon icon-history',
        action:  'rollback',
        enabled: !!a.rollback
      }
    ];

    return choices;
  }),

  actions: {
    upgrade() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');
      const vKeys         = Object.keys(get(this, 'catalogTemplate.versionLinks'));
      const latestVersion =  vKeys[vKeys.length - 1];

      get(this, 'router').transitionTo('global-admin.multi-cluster-apps.catalog.launch', templateId, {
        queryParams: {
          appId:       get(this, 'id'),
          catalog:     catalogId,
          upgrade:     latestVersion,
        }
      });
    },

    rollback() {
      get(this, 'modalService').toggleModal('modal-rollback-mc-app', {
        originalModel: this,
        revisionsLink: this.links.revisions,
      });
    },

    clone() {
      const templateId    = get(this, 'externalIdInfo.templateId');
      const catalogId     = get(this, 'externalIdInfo.catalog');

      get(this, 'router').transitionTo('global-admin.multi-cluster-apps.catalog.launch', templateId, {
        queryParams: {
          appId:       get(this, 'id'),
          catalog:     catalogId,
          clone:       true
        }
      });
    }

  },

})

export default MultiClusterApp;
