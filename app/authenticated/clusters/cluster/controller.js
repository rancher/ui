import Controller from '@ember/controller';

export default Controller.extend({
  // might be an ember bug but if we dont have an empty controller here the transtion from the cluster managemnt page
  // via launchOnCluster and useKubernetes fails because of a missing lookup.
});
