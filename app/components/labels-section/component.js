import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  model: null,

  labelArray: function() {
    var out = [];
    var obj = this.get('model')||{};
    var keys = Ember.keys(obj);
    keys.forEach(function(key) {
      var isUser = key.indexOf(C.LABEL.SYSTEM_PREFIX) !== 0;
      out.push(Ember.Object.create({
        key: key,
        value: obj[key],
        isUser: isUser,
        kind: (isUser ? 'User' : 'System'),
      }));
    });

    return out;
  }.property('model.@each.{key,value}'),
});
