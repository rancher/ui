import Controller from '@ember/controller';
import { get } from '@ember/object';

export default Controller.extend({
  model:   null,
  compose: function(){
    return get(this, 'model');
  }.property('model'),
  actions: {
    cancel(){
      this.transitionToRoute('pipelines')
    }
  },
});
