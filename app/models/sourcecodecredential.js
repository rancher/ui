import Resource from 'ember-api-store/models/resource';
import { computed } from '@ember/object';

export default Resource.extend({
  type:           'sourcecodecredential',
  username:       computed.reads('displayName'),
  profilePicture: computed.reads('avatarUrl'),
  profileUrl:     computed.reads('htmlUrl'),
});
