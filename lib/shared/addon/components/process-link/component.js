import Ember from 'ember';

const IN_APP = ['container', 'instance', 'stack', 'host', 'service'];

export default Ember.Component.extend({
  model: null,

  tagName: '',
  endpoint: Ember.inject.service(),
  growl: Ember.inject.service(),

  inApp: function() {
    return IN_APP.indexOf(this.get('model.resourceType')) >= 0;
  }.property('model.resourceType'),

  resourceLink: function() {
    if ( this.get('model').hasLink('resource') )
    {
      return this.get('model').linkFor('resource');
    }
    else
    {
      // Strip trailing slash off of the absoluteEndpoint
      var url = this.get('endpoint.absolute').replace(/\/+$/,'') + '/';

      // And strip leading slashes off the API endpoint
      url += this.get('app.apiEndpoint').replace(/^\/+/,'') + '/';

      url += this.get('model.resourceType') + '/' + this.get('model.resourceId');
      return url;
    }
  }.property('model.{resourceType,resourceId}','model.links.self'),

  actions: {
    showInApp() {
      this.get('userStore').find(this.get('model.resourceType'), this.get('model.resourceId')).then((response) => {

        let type = response.type;
        let accountId = response.accountId;
        let id = response.id;
        let stackId = response.stackId;

        var url = this.get('model').linkFor('self');

        switch (type) {
          case 'container':
          case 'instance':
            url = `/env/${accountId}/infra/containers/${id}`;
            break;
          case 'environment':
            url = `/env/${accountId}/apps/${id}`;
            break;
          case 'host':
            url = `/env/${accountId}/infra/hosts/${id}/containers`;
            break;
          case 'service':
            url = `/env/${accountId}/apps/stacks/${stackId}/services/${id}`;
            break;
        }

        window.open(url, '_blank');
      }).catch((err) => {
        this.get('growl').fromError('Error getting resource', err);
      });
    }
  }
});
