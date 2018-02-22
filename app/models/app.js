import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { parseHelmExternalId } from 'ui/utils/parse-externalid';
import { inject as service } from '@ember/service';

const App = Resource.extend({
  catalog:      service(),
  externalIdInfo: computed('externalId', function() {
    return parseHelmExternalId(get(this, 'externalId'));
  }),
  catalogTemplate: computed('externalIdInfo.templateId', function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }),
  availableActions: computed('actionLinks.{rollback,upgrade}', function () {
    let al = get(this, 'actionLinks')
    let l = get(this,'links');

    var choices = [
      { label:   'action.rollback', icon:   'icon icon-backup', action:          'rollback', enabled:     !!al.rollback, bulkable: false },
      { label:   'action.upgrade', icon:    'icon icon-arrow-circle-up', action: 'upgrade', enabled:      !!al.upgrade, bulkable:  false },
      { label:   'action.remove',     icon: 'icon icon-trash',        action:    'promptDelete', enabled: !!l.remove, altAction:   'delete', bulkable: true},
      { divider: true },
      { label:   'action.viewInApi',  icon: 'icon icon-external-link', action:   'goToApi',      enabled: true},
    ];

    return choices;
  }),
});
export default App;
