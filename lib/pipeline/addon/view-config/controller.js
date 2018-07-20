import Controller from '@ember/controller';
import { get } from '@ember/object';

export default Controller.extend({
  actions: {
    cancel(){
      this.transitionToRoute('pipelines')
    }
  },
  compose: function(){
    return get(this, 'model');
  }.property('model'),
  model:   null,
});
