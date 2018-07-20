import { normalizeType } from 'ember-api-store/utils/normalize';
import Resource from 'ember-api-store/models/resource';

var TypeDocumentation = Resource.extend();

TypeDocumentation.reopenClass({
  mangleIn(data) {
    // Pass IDs through the type normalizer so they will match the case in other places like store.find('schema',normalizeType('thing'))
    data.id = normalizeType(data.id);

    return data;
  },
});

export default TypeDocumentation;
