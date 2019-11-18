import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['id', 'context'],
  id:          null,
  context:     null,
});
