import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  trafficPolicy: null,

  model: alias('trafficPolicy.outlierDetection'),

  init() {
    this._super(...arguments);

    this.initOutlierDetection();
  },

  initOutlierDetection() {
    if ( !get(this, 'trafficPolicy.outlierDetection') && get(this, 'editing') ) {
      set(this, 'trafficPolicy.outlierDetection', {
        baseEjectionTime:   '30s',
        consecutiveErrors:  5,
        interval:           '10s',
        maxEjectionPercent: 10,
      });
    }
  },

});
