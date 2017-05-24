import Ember from 'ember';

export default Ember.Route.extend({
  model(params/* , transistion */) {
    // debugger;
    return this.get('store').find('hosttemplate', params.template_id).then((template) => {
      var config = this.get('store').createRecord(template.publicValues);
      var tmp = {
        type: 'host',
        [config.type]: config,
        hostTemplateId: template.id
      };
      return {
        template: template,
        host: this.get('store').createRecord(tmp)
      }
    });
  }
});
