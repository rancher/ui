import EmberObject from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  params: null,
  model: function(params /*, transition*/ ) {
    this.set('params', params);
    return this.get('userStore').find('processinstance', params.process_id).then((processInstance) => {
      return processInstance.followLink('processExecutions').then((processExecutions) => {
        var sorted = processExecutions.get('content').reverse();
        processExecutions.set('content', sorted);
        return EmberObject.create({
          processInstance: processInstance,
          processExecutions: processExecutions
        });
      }, ( /*reject*/ ) => {
        //do some errors
      });
    });
  }
});
