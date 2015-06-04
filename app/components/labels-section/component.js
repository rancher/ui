import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  model: null,

  labelArray: function() {
    var out = [];
    var obj = this.get('model')||{};
    var keys = Ember.keys(obj);
    keys.forEach(function(key) {
      var type = 'user';
      if ( key.indexOf(C.LABEL.SCHED_AFFINITY) === 0 )
      {
        type = 'affinity';
      }
      else if ( key.indexOf(C.LABEL.SYSTEM_PREFIX) === 0 )
      {
        type = 'system';
      }

      out.push(Ember.Object.create({
        key: key,
        value: obj[key],
        type: type,
        isUser: (type === 'user'),
      }));
    });

    return out;
  }.property('model.@each.{key,value}'),
});
