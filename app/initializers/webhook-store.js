import initializer from 'ember-api-store/initializers/store';

export default {
  name:       'webhook-store',
  initialize: initializer('webhook-store', 'webhookStore')
};
