import Resource from '@rancher/ember-api-store/models/resource';
import { get } from '@ember/object';

export default Resource.extend({
  type:     'sourcecodecredential',
  username: function(){
    return get(this, 'displayName');
  }.property('displayName'),
  profilePicture: function(){
    return get(this, 'avatarUrl');
  }.property('avatarUrl'),
  profileUrl: function(){
    return get(this, 'htmlUrl');
  }.property('htmlUrl'),
});
