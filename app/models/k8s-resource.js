import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { normalizeType } from 'ember-api-store/utils/normalize';

var K8sResource = Resource.extend({
  actions: {
    edit() {
      this.get('router').transitionTo('k8s-tab.apply', {
        queryParams: {
          name: this.metadata.name,
          kind: this.get('kind'),
        }
      });
    },
  },

  linkFor: function(name) {
    var url = this.get(`metadata.${name}Link`);
    if ( url )
    {
      url = this.get('app.kubernetesEndpoint') + url;
    }
    return url;
  },

  type: function() {
    return normalizeType(`${C.K8S.TYPE_PREFIX}${this.get('kind')}`);
  }.property('kind'),

  hasLabel(key, want=undefined) {
    var labels = this.get('metadata.labels')||{};
    var have = labels[key];

    // The key doesn't exist
    if ( have === undefined )
    {
      return false;
    }

    // Just checking if the key exists
    if ( want === undefined )
    {
      return true;
    }

    // Really matches
    if ( have === want )
    {
      return true;
    }

    // Sorta matches
    return (have && want && (have+"") === (want+""));
  },

  delete: function(/*arguments*/) {
    var store = this.get('store');
    var type = this.get('type');

    return this.request({
      method: 'DELETE',
      url: this.linkFor('self')
    }).then((newData) => {
      store._remove(type, this);
      return newData;
    }).catch((err) => {
      this.get('growl').fromError('Delete Error',err);
    });
  },

  availableActions: function() {
    var choices = [
      { label: 'Edit',            icon: 'icon icon-edit',             action: 'edit',           enabled: true },
      { divider: true },
      { label: 'Delete',          icon: 'icon icon-trash',            action: 'promptDelete',   enabled: true, altAction: 'delete', color: 'text-warning' },
    ];

    return choices;
  }.property(),

  displayName: function() {
    return this.get('metadata.name') || '('+this.get('id')+')';
  }.property('metadata.name','id'),
});

export default K8sResource;
