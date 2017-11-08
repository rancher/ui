import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return this.get('store').findAll('registrycredential').then(() => {
      return this.get('store').findAll('registry');
    });
  },
});
