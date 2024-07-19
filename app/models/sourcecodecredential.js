import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';

export default Resource.extend({
  type:     'sourcecodecredential',
  username: computed('displayName', function(){
    return this.displayName;
  }),
  profilePicture: computed('avatarUrl', function(){
    return this.avatarUrl;
  }),
  profileUrl: computed('htmlUrl', function(){
    return this.htmlUrl;
  }),
});
