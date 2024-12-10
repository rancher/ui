import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';

var HttpIngressPath = Resource.extend({ service: reference('serviceId'), });

export default HttpIngressPath;
