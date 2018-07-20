import { defineProperty, computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import Util from 'ui/utils/util';

export default Mixin.create({
  // defineStateCounts('arrangedInstances', 'instanceStates', 'instanceCountSort');
  defineStateCounts(inputKey, countsProperty, sortProperty) {
    // after a mixin is instantiated they seal the props which prevents us from pushing more objs into reservedKeys
    // BUT they dont freeze them so we can set it again. just clone it push the new values in and then set it
    var rkCln = this.get('reservedKeys').slice(0);

    rkCln.pushObjects([countsProperty, sortProperty]);
    this.set('reservedKeys', rkCln);
    defineProperty(this, countsProperty, computed(`${ inputKey }.@each.displayState`, () => {
      let byName = [];
      let byColor = [];
      let good = 0;
      let notGood = 0;

      (this.get(inputKey) || []).sortBy('sortState').forEach((inst) => {
        let color = inst.get('stateBackground');

        if ( color === 'bg-muted' ) {
          color = 'bg-success';
        }

        if ( color === 'bg-success' ) {
          good++;
        } else {
          notGood++;
        }

        let state = inst.get('displayState');
        let entry = byName.findBy('state', state);

        if ( entry ) {
          entry.count++;
        } else {
          entry = {
            state,
            color,
            count: 1
          };
          byName.push(entry);
        }

        entry = byColor.findBy('color', color);
        if ( entry ) {
          entry.count++;
        } else {
          entry = {
            color,
            count: 1
          };
          byColor.push(entry);
        }
      });

      return {
        byName,
        byColor,
        good,
        notGood,
      };
    }));

    defineProperty(this, sortProperty, computed(countsProperty, `${ inputKey }.[]`, () => {
      let colors = this.get(`${ countsProperty }.byColor`);
      let success = (colors.findBy('bg-success') || {}).count + (colors.findBy('bg-muted') || {}).coun;
      let error = (colors.findBy('bg-error') || {}).count;
      let other = this.get(`${ inputKey }.length`) - success - error;

      return Util.strPad(error,   6, '0') +
             Util.strPad(other,   6, '0') +
             Util.strPad(success, 6, '0');
    }));
  }
});
