import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import { inject as service } from '@ember/service';

const App = Resource.extend({
  catalog:      service(),
  router:       service(),
  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),
  catalogTemplate: computed('externalIdInfo.templateId', function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),
  actions: {
    edit() {
      let templateId = get(this, 'externalIdInfo.templateId');

      let versionId  = get(this, 'externalIdInfo.version');
      let catalogId  = get(this, 'externalIdInfo.catalog');

      get(this, 'router').transitionTo('catalog-tab.launch', templateId, {queryParams: {
        catalog: catalogId,
        namespaceId: get(this, 'model.installNamespace'),
        appId: get(this, 'id'),
      }});

    }
  },
  availableActions: computed('actionLinks.{rollback,upgrade}', function () {
    let al = get(this, 'actionLinks')
    let l = get(this,'links');

    var choices = [
      { label:   'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!l.update },
      { label:   'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label:   'action.viewInApi',  icon: 'icon icon-external-link', action:  'goToApi',      enabled: true},
    ];

    return choices;
  }),
});
export default App;
