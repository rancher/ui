import Catalog from 'ui/models/catalog';
import { reference } from 'ember-api-store/utils/denormalize';

export default Catalog.extend({
  level:        'cluster',
  cluster:      reference('clusterId'),
});
