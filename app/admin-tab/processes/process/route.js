import Ember from 'ember';

export default Ember.Route.extend({
  params: null,
  model: function(params /*, transition*/ ) {
    this.set('params', params);
    return this.get('store').find('processinstance', params.process_id).then((processInstance) => {
      return processInstance.followLink('processExecutions').then((processExecutions) => {
        var sorted = processExecutions.get('content').reverse();
        processExecutions.set('content', sorted);
        return Ember.Object.create({
          processInstance: processInstance,
          processExecutions: processExecutions
        });
      }, ( /*reject*/ ) => {
        //do some errors
      });
    });
  },
  intervalId: null,
  setupController: function(controller, model) {
    this._super(controller, model);
    const intervalCount = 2000;
    if (!this.get('intervalId')) {
      this.set('intervalId', setInterval(() => {
        this.get('store').find('processInstance', this.get('params').process_id).then((processInstance) => {
          processInstance.followLink('processExecutions').then((processExecutions) => {
            var sorted = processExecutions.get('content').reverse();
            processExecutions.set('content', sorted);
            this.controller.get('model.processExecutions').replaceWith(processExecutions);
          });
        });
      }, intervalCount));
    }
  },
  deactivate: function() {
    clearInterval(this.get('intervalId'));
  }
});
