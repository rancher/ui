import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['category', 'catalogId'],
  category:    '',
  catalogId:   '',
});
