import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Controller.extend(ManageLabels, {
  settings      : Ember.inject.service(),
  cattleAgentIp : null,

  actions: {
    setLabels(labels) {
      let out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('model.labels', out);
    },
  },

  registrationCommand: function() {
    let cmd      = this.get('model.command');
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
        cmd = `${cmd.substr(0, idx + lookFor.length)} -e CATTLE_AGENT_IP='${cattleIp}' ${cmd.substr(idx + lookFor.length)}`;
      }

    }

    return cmd;
  }.property('model.command','model.labels', 'cattleAgentIp'),

});
