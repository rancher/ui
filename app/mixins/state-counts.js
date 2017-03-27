import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Mixin.create({
  // defineStateCounts('arrangedInstances', 'instanceStates', 'instanceCountSort');
  defineStateCounts(inputKey, countsProperty, sortProperty) {

    this.get('reservedKeys').pushObjects([countsProperty, sortProperty]);
    this.set(countsProperty, Ember.computed(`${inputKey}.@each.state`, () => {
      let byName = [];
      let byColor = [];

      this.get(inputKey).sortBy('stateSort').forEach((inst) => {
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
    }));

    this.set(sortProperty, Ember.computed(countsProperty, `${inputKey}.[]`, () => {
      let colors = this.get(`${countsProperty}.byColor`);
      let success = (colors.findBy('bg-success')||{}).count;
      let error = (colors.findBy('bg-error')||{}).count;
      let other = this.get(`${inputKey}.length`) - success - error;

      return Util.strPad(error,   6, '0') +
             Util.strPad(other,   6, '0') +
             Util.strPad(success, 6, '0');
    }));
  }
});
