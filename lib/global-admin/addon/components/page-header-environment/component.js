import EnvHeader from 'shared/components/page-header-environment/component';
import layout from './template';
import { inject as service } from '@ember/service';

export default EnvHeader.extend({
  layout,
  clusterStore: service('cluster-store'),
});
