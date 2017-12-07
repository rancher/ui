import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ManageLabels, {
  settings      : Ember.inject.service(),
  projects      : Ember.inject.service(),
  cattleAgentIp : null,
  model         : null,
  subnet        : null,
  routerIp      : null,

  actions: {
    cancel() {
      this.attrs.cancel();
    },

    setLabels(labels) {
      if ( this.get('model') ) {
        var out = {}; 
        const oldlabels = Object.assign({}, this.get('model.labels'));
        if(!labels){
          labels={};
        }
        for(var tmp in oldlabels){
          out[tmp]=oldlabels[tmp];
        }
        labels.forEach((row) => {
          out[row.key] = row.value;
        });

        this.set('model.labels', out);
      }
    },

    subnetOnChange(){
      if ( this.get('model') ) {
        var out = {};
        const labels = Object.assign({}, this.get('model.labels'));
        for(var tmp in labels){
          out[tmp]=labels[tmp];
        }
        var subnet=this.get('subnet');
        var routerIp=this.get('routerIp');
        if (subnet) {
          out[C.LABEL.PER_HOST_SUBNET]=subnet;
        }
        if (routerIp) {
          out[C.LABEL.PER_HOST_SUBNET_ROUTING_IP]=routerIp;
        }
        this.set('model.labels',out);
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

  registrationCommandWindows: function() {
    let url = this.get('model.registrationUrl');
    let cattleIp = this.get('cattleAgentIp');
    let env = Util.addQueryParams('', this.get('model.labels')||{});
    let cmd1=`New-Item -Path 'C:\\Program Files\\rancher' -Type Directory`;
    let cmd2 = this.get('model.windowsCommand');
    cmd2 = cmd2 + ` -RegisterUrl ${url}`;
    if (env) {
      env = env.substr(1);
      cmd2 = cmd2 + ` -HostLabels "${env}"`;
    }
    if (cattleIp){
      cmd2 = cmd2 + ` -AgentIp "${cattleIp}"`;
    }
    cmd2 = `$obj=$(${cmd2})`;
    let cmd3 = `$obj |& "C:\\Program Files\\rancher\\startup.ps1"`;
    return cmd1 + "\n" + cmd2 + "\n" + cmd3;
  }.property('model.command','model.labels', 'cattleAgentIp'),

});
