import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { normalizeType } from 'ember-api-store/utils/normalize';

var K8sResource = Resource.extend({
  endpointSvc: Ember.inject.service('endpoint'),
  k8s: Ember.inject.service(),

  actions: {
    edit() {
      this.get('router').transitionTo('k8s-tab.apply', {
        queryParams: {
          name: this.metadata.name,
          kind: this.get('kind'),
        }
      });
    },

    goToApi: function() {
      var url = this.linkFor('self').replace(/^\//,'');
      window.open(url, '_blank');
    },
  },

  linkFor: function(name) {
    var url = this.get(`metadata.${name}Link`);
    if ( url )
    {
      url = this.get('app.kubernetesEndpoint').replace(this.get('app.projectToken'), this.get(`tab-session.${C.SESSION.PROJECT}`)) + url;
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
    return (have && want && ((have+"") === (want+"")));
  },

  hasAnnotation(key, want=undefined) {
    var annotations = this.get('metadata.annotations')||{};
    var have = annotations[key];

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
    return (have && want && ((have+"") === (want+"")));
  },

  delete: function(/*arguments*/) {
    //var store = this.get('store');
    var type = this.get('type');
    var name = this.get('metadata.name');

    var promise;
    if ( this.get('k8s.supportsStacks') ) {
      promise = this.get('k8s').remove(type.replace(C.K8S.TYPE_PREFIX,''), name);
    } else {
      promise = this.request({
        method: 'DELETE',
        url: this.linkFor('self')
      });
    }

    promise.then((newData) => {
      //store._remove(type, this);
      return newData;
    }).catch((err) => {
      this.get('growl').fromError('Error deleting',err);
    });
  },

  availableActions: function() {
    var choices = [
      { label: 'action.edit',      icon: 'icon icon-edit',           action: 'edit',         enabled: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'action.remove',    icon: 'icon icon-trash',          action: 'promptDelete', enabled: true, altAction: 'delete'},
    ];

    return choices;
  }.property(),

  displayName: function() {
    return this.get('metadata.name') || '('+this.get('id')+')';
  }.property('metadata.name','id'),
});

export default K8sResource;
