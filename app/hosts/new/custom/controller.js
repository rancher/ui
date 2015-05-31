import Ember from 'ember';
import EditLabels from 'ui/mixins/edit-labels';
import Util from 'ui/utils/util';

export default Ember.ObjectController.extend(EditLabels, {
  primaryResource: Ember.computed.alias('model'),
  needs: ['application'],

  registrationCommand: function() {
    var cmd = this.get('command');
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
  }.property('command','model.labels'),

});
