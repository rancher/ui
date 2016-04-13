import initializer from 'ember-api-store/initializers/ember-api-store';

export default {
  name: 'user-store',
  initialize: initializer('user','userStore')
};
