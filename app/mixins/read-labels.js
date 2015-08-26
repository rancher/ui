import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  labelResource: null,

  labelArray: function() {
    var out = [];
    var obj = this.get('labelResource.labels')||{};
    var keys = Object.keys(obj).sort();
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
  }.property('labelResource.labels.@each.{key,value}'),

  userLabelArray: function() {
    return this.get('labelArray').filterBy('isUser', true);
  }.property('labelArray.@each.{key,value,isUser}'),

  systemLabelArray: function() {
    return this.get('labelArray').filterBy('isUser', false);
  }.property('labelArray.@each.{key,value,isUser}'),

  getLabel: function(key) {
    key = (key||'').toLowerCase();
    var ary = this.get('labelArray');
    var item;
    for ( var i = 0 ; i < ary.get('length') ; i++ )
    {
      item = ary.objectAt(i);
      if ( item.get('key').toLowerCase() === key )
      {
        return item;
      }
    }

    return null;
  },
});
