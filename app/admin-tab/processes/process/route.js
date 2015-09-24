import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params /*, transition*/) {
    return this.get('store').find('processinstance', params.process_id).then((processInstance) => {
      return processInstance.followLink('processExecutions').then((processExecutions) => {
        var sorted = processExecutions.get('content').reverse();
        processExecutions.set('content', sorted);
        return Ember.Object.create({
          processInstance: processInstance,
          processExecutions: processExecutions
        });
      }, (/*reject*/) => {
        //do some errors
      });
    });
  }
});
