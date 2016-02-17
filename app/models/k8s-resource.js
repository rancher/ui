import Resource from 'ember-api-store/models/resource';

var K8sResource = Resource.extend({
  displayName: function() {
    return this.get('metadata.name') || '('+this.get('id')+')';
  }.property('metadata.name','id'),
});

export default K8sResource;
