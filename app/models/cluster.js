import { get, set, computed } from '@ember/object';

import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import { hasMany } from 'ember-api-store/utils/denormalize';
import ResourceUsage from 'shared/mixins/resource-usage';
import { alias } from '@ember/object/computed';
import { resolve } from 'rsvp';

export default Resource.extend(ResourceUsage, {
  globalStore:  service(),
  growl:        service(),
  scope:        service(),
  router:       service(),

  namespaces: hasMany('id', 'namespace', 'clusterId'),
  projects: hasMany('id', 'project', 'clusterId'),
  nodes: hasMany('id', 'node', 'clusterId'),
  nodePools: hasMany('id', 'nodePool', 'clusterId'),
  machines: alias('nodes'),
  clusterRoleTemplateBindings: hasMany('id', 'clusterRoleTemplateBinding', 'clusterId'),
  roleTemplateBindings: alias('clusterRoleTemplateBindings'),

  actions: {
    edit() {
      this.get('router').transitionTo('authenticated.cluster.edit', this.get('id'));
    },

    scaleDownPool(id) {
      const pool = (get(this,'nodePools')||[]).findBy('id', id);
      if ( pool ) {
        pool.incrementQuantity(-1);
      }
    },

    scaleUpPool(id) {
      const pool = (get(this,'nodePools')||[]).findBy('id', id);
      if ( pool ) {
        pool.incrementQuantity(1);
      }
    },
  },

  configName: computed(function() {
    const keys = this.allKeys().filter(x => x.endsWith('Config'));
    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( get(this,key) ) {
        return key;
      }
    }

    return null;
  }),

  provider: computed('configName','nodePools.@each.nodeTemplateId', function() {
    const pools = get(this,'nodePools')||[];
    const firstTemplate = get(pools,'firstObject.nodeTemplate');

    switch ( get(this,'configName') ) {
      case 'azureKubernetesServiceConfig':
        return 'azureaks';
      case 'googleKubernetesEngineConfig':
        return 'googlegke';
      case 'rancherKubernetesEngineConfig':
        if ( !!pools ) {
          if ( firstTemplate ) {
            return get(firstTemplate, 'driver');
          } else {
            return null;
          }
        } else {
          return 'custom';
        }
      default:
        return 'import';
    }
  }),

  displayProvider: computed('configName','nodePools.firstObject.displayProvider','intl.locale', function() {
    const intl = get(this, 'intl');
    const pools = get(this,'nodePools');
    const firstPool = (pools||[]).objectAt(0);

    switch ( get(this,'configName') ) {
      case 'azureKubernetesServiceConfig':
        return intl.t('clusterNew.azureaks.shortLabel');
      case 'googleKubernetesEngineConfig':
        return intl.t('clusterNew.googlegke.shortLabel');
      case 'rancherKubernetesEngineConfig':
        if ( !!pools ) {
          if ( firstPool ) {
            return get(firstPool, 'displayProvider');
          } else {
            return intl.t('clusterNew.rke.shortLabel');
          }
        } else {
            return intl.t('clusterNew.custom.shortLabel');
        }
      default:
        return intl.t('clusterNew.import.shortLabel');
    }
  }),

  clearProvidersExcept(keep) {
    const keys = this.allKeys().filter(x => x.endsWith('Config'));

    for ( let key, i = 0 ; i < keys.length ; i++ ) {
      key = keys[i];
      if ( key !== keep && get(this,key) ) {
        set(this, key, null);
      }
    }
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

  getOrCreateToken() {
    const globalStore = get(this, 'globalStore');
    const id = get(this, 'id');

    return globalStore.findAll('clusterRegistrationToken').then((tokens) => {
      let token = tokens.filterBy('clusterId', id)[0];
      if ( token ) {
        return resolve(token);
      } else {
        token = get(this, 'globalStore').createRecord({
          type: 'clusterRegistrationToken',
          clusterId: id
        });

        return token.save();
      }
    });
  },
});
