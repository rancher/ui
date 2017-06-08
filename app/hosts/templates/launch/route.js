import Ember from 'ember';

export default Ember.Route.extend({
  model(params/* , transistion */) {
    return this.get('store').find('hosttemplate', params.template_id).then((template) => {
      return this.get('userStore').find('machinedriver', null, {forceReload: true}).then((drivers) => {
        var driver = drivers.findBy('name', template.driver);
        var configId = `${template.driver}Config`;
        var config = this.get('store').createRecord(template.publicValues[configId]);
        var tmp = {
          type: 'host',
          hostTemplateId: template.id
        };
        return {
          template: template,
          config: config,
          host: this.get('store').createRecord(tmp),
          driver: driver,
        }
      });
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
