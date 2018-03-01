import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'stagestatus',
  stepStates: function() {
    let steps = this.get('steps');
    let states = '';
    for (var i = 0; i < steps.length; i++) {
      let item = steps[i];
      states += `-${item.state}`
    }
    return states;
  }.property('steps.[].state'),
});
