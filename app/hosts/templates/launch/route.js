import Ember from 'ember';

export default Ember.Route.extend({
  model(params/* , transistion */) {
    // debugger;
    return this.get('store').find('hosttemplate', params.template_id).then((template) => {
      var configId = '';
      for(var key in template.publicValues) {
        configId = key;
        break;
      }
      var config = this.get('store').createRecord(template.publicValues[configId]);
      var tmp = {
        type: 'host',
        hostTemplateId: template.id
      };
      return {
        template: template,
        config: config,
        host: this.get('store').createRecord(tmp)
      }
    });
  },
  actions: {
    cancel() {
      this.transitionTo('hosts.templates.index');
    },
    goBack() {
      if ( this.get('backTo') === 'waiting' ) {
        this.transitionTo('authenticated.project.waiting');
      } else {
        this.transitionTo('hosts');
      }
    }
  },
});
