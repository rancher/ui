import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';

export default Resource.extend({
  catalog: service(),

  type: 'catalogTemplate',

  externalId: function() {
    let id = this.get('templateVersionId') || this.get('templateId');

    if ( id ) {
      return C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + id;
    }
  }.property('templateVersionId', 'templateId'),

  externalIdInfo: function() {
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),

  // These only works if the templates have already been loaded elsewhere...
  catalogTemplate: function() {
    return this.get('catalog').getTemplateFromCache(this.get('externalIdInfo.templateId'));
  }.property('externalIdInfo.templateId'),

  icon: function() {
    let tpl = this.get('catalogTemplate');

    if ( tpl ) {
      return tpl.linkFor('icon');
    }
  }.property('catalogTemplate'),

  categories: function() {
    let tpl = this.get('catalogTemplate');

    if ( tpl ) {
      return tpl.get('categories') || [];
    }

    return [];
  }.property('catalogTemplate.categories'),
});
