import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';

var HttpIngressPath = Resource.extend({ service: reference('serviceId'), });

export default HttpIngressPath;
