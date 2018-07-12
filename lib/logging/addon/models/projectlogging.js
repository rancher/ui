import Resource from 'ember-api-store/models/resource';
import modelMixin from 'logging/mixins/logging-model';

const ProjectLogging =  Resource.extend(modelMixin, { type: 'projectlogging', });

export default ProjectLogging;
