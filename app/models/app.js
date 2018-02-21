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
});
export default App;
