import initializer from '@rancher/ember-api-store/initializers/store';

export default {
  name:       'webhook-store',
  initialize: initializer('webhook-store', 'webhookStore')
};
