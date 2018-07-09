import Resource from 'ember-api-store/models/resource';
import { get } from '@ember/object';

export default Resource.extend({
  stepStates: function() {

    let steps = get(this, 'steps');
    let states = '';

    for (var i = 0; i < steps.length; i++) {

      let item = steps[i];

      states += `-${ item.state }`

    }

    return states;

  }.property('steps.[].state'),
  type: 'stagestatus',
});
