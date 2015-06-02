import Ember from 'ember';

export default Ember.Mixin.create({
  labelResource: null,

  labelArray: function() {
    var out = [];
    var obj = this.get('labelResource.labels')||{};
    var keys = Ember.keys(obj).sort();
    keys.forEach(function(key) {
      var isUser = key.indexOf('io.rancher') !== 0;
      out.push(Ember.Object.create({
        key: key,
        value: obj[key],
        isUser: isUser,
        kind: (isUser ? 'User' : 'System'),
      }));
    });

    return out;
  }.property('labelResource.labels.@each.{key,value}'),

  userLabelArray: function() {
    return this.get('labelArray').filterProperty('isUser', true);
  }.property('labelArray.@each.{key,value,isUser}'),

  systemLabelArray: function() {
    return this.get('labelArray').filterProperty('isUser', false);
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
