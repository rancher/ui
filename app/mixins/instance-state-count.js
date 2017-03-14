import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  instanceStatesInput: Ember.computed.alias('arrangedInstances'),

  instanceStates: function() {
    let byName = [];
    let byColor = [];

    this.get('instanceStatesInput').sortBy('stateSort').forEach((inst) => {
      let color = inst.get('stateBackground');
      let state = inst.get('displayState');
      let entry = byName.findBy('state', state);
      if ( entry ) {
        entry.count++;
      } else {
        entry = {state: state, color: color, count: 1};
        byName.push(entry);
      }

      entry = byColor.findBy('color', color);
      if ( entry ) {
        entry.count++;
      } else {
        entry = {color: color, count: 1};
        byColor.push(entry);
      }
    });

    return {
      byName: byName,
      byColor: byColor
    };
  }.property('instanceStatesInput.@each.state'),

  instanceCountSort: function() {
    let colors = this.get('instanceStates.byColor');
    let success = (colors.findBy('bg-success')||{}).count;
    let error = (colors.findBy('bg-error')||{}).count;
    let other = this.get('instanceStatesInput.length') - success - error;

    return Util.strPad(error,   6, '0') +
           Util.strPad(other,   6, '0') +
           Util.strPad(success, 6, '0');
  }.property('instanceStates','instanceStatesInput.length'),
});
