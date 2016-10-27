import Resource from 'ember-api-store/models/resource';
import { parseExternalId } from 'ui/utils/parse-externalid';
import C from 'ui/utils/constants';

export default Resource.extend({
  type: 'catalogTemplate',

  externalId: function() {
    let id = this.get('templateVersionId') || this.get('templateVersion');
    if ( id ) {
      return C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + id;
    }
  }.property('templateVersionId','templateVersion'),

  externalIdInfo: function() {
    return parseExternalId(this.get('externalId'));
  }.property('externalId'),
});
