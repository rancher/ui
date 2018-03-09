import Controller from '@ember/controller';

export default Controller.extend({
  model: null,
  compose: function(){
    return this.get('model');
  }.property('model'),
  actions: {
    cancel: function(){
      this.transitionToRoute('pipelines')
    }
  },
});
