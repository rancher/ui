import Ember from 'ember';
import GithubInfoMixin from 'ui/mixins/github-info';

export default Ember.Component.extend(GithubInfoMixin,{
  classNames: ['gh-avatar'],
  link: true,
});
