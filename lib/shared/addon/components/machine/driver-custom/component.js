import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ManageLabels from 'shared/mixins/manage-labels';
import Util from 'ui/utils/util';
import layout from './template';

export default Component.extend(ManageLabels, {
  layout,
  settings:                   service(),
  projects:                   service(),
  cattleAgentIp :             null,
  model:                      null,

  cluster:                    null,
  loading:                    alias('cluster.isTransitioning'),
  registrationCommandWindows: alias('cluster.registrationToken.windowsCommand'),

  _allHosts:                  null,
  hostsAtLoad:                null,

  actions: {
    cancel() {
      this.attrs.cancel();
    },

    setLabels(labels) {
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labels', out);
    }
  },

  init() {
    this._super(...arguments);
    let hosts = this.get('store').all('host');
    this.setProperties({
      _allHosts: hosts,
      hostsAtLoad: hosts.get('length'),
      labels: []
    });
  },

  registrationCommand: computed('registrationCommand','labels', 'cattleAgentIp', function() {
    let cmd      = this.get('cluster.registrationToken.hostCommand');
    let cattleIp = this.get('cattleAgentIp');
    let lookFor  = 'docker run';

    if ( !cmd ) {
      return null;
    }

    let idx = cmd.indexOf(lookFor);
    let env = Util.addQueryParams('', this.get('labels')||{});

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
  }),
  newHosts: computed('hostsAtLoad','_allHosts.length', function() {
    let atLoad = this.get('hostsAtLoad')
    let now = this.get('_allHosts.length');

    if ( now < atLoad ) {
      this.set('hostsAtLoad', now);
    }

    return Math.max(0, now-atLoad);
  }),

});
