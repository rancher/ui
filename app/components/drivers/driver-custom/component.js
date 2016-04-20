import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Component.extend(ManageLabels, {
  settings      : Ember.inject.service(),
  cattleAgentIp : null,
  model: null,

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

  bootstrap: function() {
    if (this.get('clonedModel')) {
      this.set('model', this.get('clonedModel'));
    } else {
      this.get('store').find('registrationToken',null,{filter: {state: 'active'}, forceReload: true}).then((tokens) => {
        if ( tokens.get('length') === 0 )
        {
          // There should always be one already, but if there isn't go create one...
          var model = this.get('store').createRecord({
            type: 'registrationToken'
          });
          this.set('model', model);
          model.save();
        }
        else
        {
          this.set('model', tokens.get('firstObject'));
        }
      });
    }
  }.on('init'),

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
        cmd = `${cmd.substr(0, idx + lookFor.length)} -e CATTLE_AGENT_IP="${cattleIp}" ${cmd.substr(idx + lookFor.length)}`;
      }
    }

    return cmd;
  }.property('model.command','model.labels', 'cattleAgentIp'),

});
