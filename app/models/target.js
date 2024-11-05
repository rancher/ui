import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { reference } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  project: reference('projectId'),

  projectName: computed('project.displayName', function() {
    return get(this, 'project.displayName');
  }),

  clusterName: computed('project.cluster.displayName', function() {
    return get(this, 'project.cluster.displayName');
  }),

  clusterId: computed('projectId', function() {
    let { projectId } = this;

    return projectId.split(':')[0];
  }),

  appLink: computed('projectId', 'appId', function() {
    const { projectId } = this;

    if (projectId) {
      return `${ projectId.split(':')[1] }:${ this.appId }`;
    }

    return null;
  }),

});
