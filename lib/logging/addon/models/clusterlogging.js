import Resource from 'ember-api-store/models/resource';
import modelMixin from 'logging/mixins/logging-model';

export default Resource.extend(modelMixin, { type: 'clusterlogging', });
