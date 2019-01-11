import Resource from '@rancher/ember-api-store/models/resource';
import Alert from 'ui/mixins/model-alert';

export default Resource.extend(Alert, { type: 'clusteralertgroup', });
