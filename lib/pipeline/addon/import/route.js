import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

export default Route.extend({
  globalStore: service(),
  model: function() {
    var globalStore = this.get('globalStore');
    var pipeline = globalStore.createRecord({type:'pipeline'});
    return EmberObject.create({
        pipeline: pipeline
      });
  }
});