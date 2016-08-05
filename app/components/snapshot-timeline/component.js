import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

const { get, set, computed } = Ember;
const SHIFT_DIFF = 3;
const PLOT_HEIGHT = 7;

export default Ember.Component.extend(ThrottledResize, {
  tagName: 'div',
  classNames: ['timeline-container'],
  startDate: null,
  endDate: null,
  range: null,

  init: function() {
    this._super(...arguments);

    if (!get(this, 'model') || get(this, 'model').length < 1) {
      set(this, 'classNames', []);
    }

  },

  onResize: function() {
    if (get(this, 'model')) {
      this.plotSnapshots();
    }
  },

  snapshots: computed('model', function() {
    return this.plotSnapshots();
  }),

  plotSnapshots() {

    let model = get(this, 'model');
    let snapshots = null;

    if (model && model.length > 1) {

      let prevPlot = null;
      let start = model[0].created;
      let end   = model[model.length - 1].created;
      let range = moment(end).diff(start, 'seconds');

      snapshots = model.sortBy('created');
      snapshots.forEach((snapshot) => {
        let myDate    = snapshot.created;
        let fromStart = moment(myDate).diff(start, 'seconds');
        let shift     = (fromStart/range) * 100;

        if (prevPlot !== null && prevPlot >= 0 && shift !== 100) {
          if ((shift - prevPlot) <= SHIFT_DIFF) {
            shift = prevPlot + SHIFT_DIFF;
          }
        }

        prevPlot = shift;

        set(snapshot, 'position', Ember.String.htmlSafe(`left: calc(${shift}% - ${PLOT_HEIGHT});`));
        return snapshot;
      });

      prevPlot = null;

      snapshots.reverse().forEach((snapshot) => {

        let myDate    = snapshot.created;
        let fromStart = moment(myDate).diff(start, 'seconds');
        let shift     = (fromStart/range) * 100;

        if (prevPlot !== null && shift >= 0) {
          if (Math.abs(shift - prevPlot) <= SHIFT_DIFF) {
            shift = Math.max(0, prevPlot - SHIFT_DIFF);
          }
        }

        prevPlot = shift;

        set(snapshot, 'position', Ember.String.htmlSafe(`left: calc(${shift}% - ${PLOT_HEIGHT}px);`));
        return snapshot;
      });

      snapshots.reverse();

    }

    return snapshots;
  },
});
