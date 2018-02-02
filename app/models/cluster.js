import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { hasMany } from 'ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';
import { alias } from '@ember/object/computed';


var Cluster = Resource.extend(ResourceUsage, {
  scope:        service(),
  router:       service(),

  namespaces: hasMany('id', 'namespace', 'clusterId'),
  projects: hasMany('id', 'project', 'clusterId'),
  machines: hasMany('id', 'machine', 'clusterId'),
  clusterRoleTemplateBindings: hasMany('id', 'clusterRoleTemplateBinding', 'clusterId'),
  roleTemplateBindings: alias('clusterRoleTemplateBindings'),

  canAddNode: computed('rancherKubernetesEngineConfig', function() {
    return !!this.get('rancherKubernetesEngineConfig');
  }),

  actions: {
    edit() {
      this.get('router').transitionTo('global-admin.clusters.detail.edit', this.get('id'));
    },
  },

  delete: function(/*arguments*/) {
    const promise = this._super.apply(this, arguments);

    return promise.then((/* resp */) => {
      if (this.get('scope.currentCluster.id') === this.get('id')) {
        this.get('router').transitionTo('global-admin.clusters');
      }
    });
  },

  defaultProject: computed('projects.@each.{name,clusterOwner}', function() {
    let projects = this.get('projects');

    let out = projects.findBy('isDefault');
    if ( out ) {
      return out;
    }

    out = projects.findBy('clusterOwner', true);
    if ( out ) {
      return out;
    }

    out = projects.objectAt(0);
    return out;
  }),

  systemProject: computed('projects.@each.{clusterOwner}', function() {
    return this.get('projects').findBy('clusterOwner', true);
  }),

  availableActions: computed('actionLinks.{activate,deactivate}','links.{update,remove}', function() {
    //    let a = this.get('actionLinks');
    let l = this.get('links');

    var choices = [
      { label: 'action.edit',             icon: 'icon icon-edit',         action: 'edit',         enabled: true },
      { divider: true },
      //      { label: 'action.activate',         icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate},
      //      { label: 'action.deactivate',       icon: 'icon icon-pause',        action: 'promptStop',   enabled: !!a.deactivate, altAction: 'deactivate'},
      //      { divider: true },
      { label: 'action.remove',           icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];

    return choices;
  }),
});

Cluster.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Cluster;
