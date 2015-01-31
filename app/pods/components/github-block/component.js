import Ember from 'ember';
import GithubUserInfoMixin from 'ui/mixins/github-user-info';

export default Ember.Component.extend(GithubUserInfoMixin,{
  classNames: ['gh-block'],
  avatar: true,
});
