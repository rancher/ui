import Resource from 'ember-api-store/models/resource';
import modelMixin from 'ui/mixins/logging-model';

const ProjectLogging =  Resource.extend(modelMixin, { type: 'projectlogging', });

export default ProjectLogging;
