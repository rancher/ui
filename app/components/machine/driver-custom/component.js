import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Component.extend(ManageLabels, {
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),
  cattleAgentIp : null,
  model: null,

  cluster: null,
  loading: Ember.computed.alias('cluster.isTransitioning'),

  _allHosts: null,
  hostsAtLoad: null,

  actions: {
    cancel() {
      this.attrs.cancel();
    },

    setLabels(labels) {
      if ( this.get('model') ) {
        var out = {};
        labels.forEach((row) => {
          out[row.key] = row.value;
        });

        this.set('model.labels', out);
      }
    }
  },

  init() {
    this._super(...arguments);
    let hosts = this.get('store').all('host');
    this.setProperties({
      _allHosts: hosts,
      hostsAtLoad: hosts.get('length'),
    });
  },

  registrationCommand: function() {
    let cmd      = this.get('cluster.registrationToken.hostCommand');
    let cattleIp = this.get('cattleAgentIp');
    let lookFor  = 'docker run';

    if ( !cmd ) {
      return null;
    }

    let idx = cmd.indexOf(lookFor);
    let env = Util.addQueryParams('', this.get('model.labels')||{});

    if ( env ) {
      lookFor  = 'docker run';
      idx      = cmd.indexOf(lookFor);
      env = env.substr(1); // Strip off the leading '?'
      if ( idx >= 0 ) {
        cmd = `${cmd.substr(0, idx + lookFor.length)} -e CATTLE_HOST_LABELS='${env}' ${cmd.substr(idx + lookFor.length)}`;
      }
    }

    if (cattleIp) {
      if ( idx >= 0 ) {
        cmd = `${cmd.substr(0, idx + lookFor.length)} -e CATTLE_AGENT_IP="${cattleIp}" ${cmd.substr(idx + lookFor.length)}`;
      }
    }

    return cmd;
  }.property('model.command','model.labels', 'cattleAgentIp'),

  registrationCommandWindows: Ember.computed.alias('cluster.registrationToken.windowsCommand'),

  newHosts: function() {
    let atLoad = this.get('hostsAtLoad')
    let now = this.get('_allHosts.length');

    if ( now < atLoad ) {
      this.set('hostsAtLoad', now);
    }

    return Math.max(0, now-atLoad);
  }.property('hostsAtLoad','_allHosts.length'),

});
