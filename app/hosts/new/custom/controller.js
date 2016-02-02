import Ember from 'ember';
import ManageLabels from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Controller.extend(ManageLabels, {
  settings: Ember.inject.service(),

  actions: {
    setLabels(labels) {
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('model.labels', out);
    }
  },

  registrationCommand: function() {
    var cmd = this.get('model.command');
    if ( !cmd )
    {
      return null;
    }

    var env = Util.addQueryParams('', this.get('model.labels')||{});
    if ( env )
    {
      env = env.substr(1); // Strip off the leading '?'
      var lookFor = 'docker run';
      var idx = cmd.indexOf(lookFor);
      if ( idx >= 0 )
      {
        cmd = cmd.substr(0, idx + lookFor.length) + " -e CATTLE_HOST_LABELS='" + env + "'" + cmd.substr(idx + lookFor.length);
      }
    }

    return cmd;
  }.property('model.command','model.labels'),

});
