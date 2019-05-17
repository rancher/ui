import Component from '@ember/component';
import layout from './template';
import C from 'ui/utils/constants';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';

export default Component.extend({
  prefs:  service(),

  layout,

  tagName:    'section',
  classNames: ['recent-clusters'],

  activeClusterProvider:     null,
  allActiveClusterProviders: null,

  init() {
    this._super(...arguments);

    this.initRecentClusters();
  },

  actions: {
    removeRecent(clusterName) {
      let recentClusters = get(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`) || [];

      recentClusters.removeObject(clusterName);

      set(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`, recentClusters);
    }
  },

  recentClusterProviders: computed(`prefs.${ C.PREFS.RECENT_CLUSTERS }`, function() {
    let recentProviders               = get(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`) || [];
    let { allActiveClusterProviders } = this;
    let out                           = recentProviders.map((provider) => {
      return allActiveClusterProviders.findBy('name', provider);
    })

    return out;
  }),

  clusterDriverError() {
    throw new Error('clusterDriverError action is required!');
  },

  initRecentClusters() {
    let { allActiveClusterProviders } = this;
    let recentClusters                = get(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`) ? get(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`).slice() : [];
    let activeClusterProvider         = get(this, 'activeClusterProvider');
    let providerName                  = activeClusterProvider ? get(activeClusterProvider, 'name') : null;
    let activeRecentClusters          = recentClusters.filter((rc) => {
      if (allActiveClusterProviders.findBy('name', rc)) {
        return true;
      }

      return false;
    });

    if (providerName) {
      if (activeRecentClusters.includes(providerName)) {
        activeRecentClusters = activeRecentClusters.removeObject(providerName);

        activeRecentClusters.unshiftObject(providerName);
      } else {
        if (activeRecentClusters.length === 5) {
          activeRecentClusters.pop();

          activeRecentClusters.unshiftObject(providerName);
        } else {
          activeRecentClusters.unshiftObject(providerName);
        }
      }
    } else {
      this.clusterDriverError();
    }

    if (activeRecentClusters.uniq().length > 5) {
      activeRecentClusters = activeRecentClusters.slice(0, 5);
    }

    set(this, `prefs.${ C.PREFS.RECENT_CLUSTERS }`, activeRecentClusters.uniq());
  },

});
