import Resource from 'ember-api-store/models/resource';
import modelMixin from 'ui/mixins/logging-model';

export default Resource.extend(modelMixin, { type: 'clusterlogging', });
