import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  type:     'sourcecodecredential',
  username: computed('displayName', function(){
    return get(this, 'displayName');
  }),
  profilePicture: computed('avatarUrl', function(){
    return get(this, 'avatarUrl');
  }),
  profileUrl: computed('htmlUrl', function(){
    return get(this, 'htmlUrl');
  }),
});
