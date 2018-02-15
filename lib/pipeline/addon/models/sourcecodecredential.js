 import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'sourcecodecredential',
  username: function(){
    return this.get('displayName');
  }.property('displayName'),
  profilePicture: function(){
    return this.get('avatarUrl');
  }.property('avatarUrl'),
  profileUrl:function(){
    return this.get('htmlUrl');
  }.property('htmlUrl')
});
