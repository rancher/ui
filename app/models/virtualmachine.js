import Ember from 'ember';
import Container from 'ui/models/container';

export default Container.extend({
  actions: {
    console: function() {
      this.get('application').setProperties({
        showConsole: true,
        originalModel: this,
      });
    },

    popoutShellVm: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/console-vm?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=845,height=585,left=200,top=200");
      });
    },

    popoutLogs: function() {
      let proj = this.get('projects.current.id');
      let id = this.get('id');
      Ember.run.later(() => {
        window.open(`//${window.location.host}/env/${proj}/infra/vm-log?instanceId=${id}&isPopup=true`, '_blank', "toolbars=0,width=700,height=715,left=200,top=200");
      });
    },
  },
});
