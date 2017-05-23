import Ember from 'ember';

export default Ember.Route.extend({
  model(params/* , transistion */) {
    var templates = this.modelFor('hosts.templates.index');
    if (templates) {
      return templates.findBy('id', params.template_id);
    } else {
      return this.get('store').find('hosttemplate', params.template_id);
    }
  }
});
