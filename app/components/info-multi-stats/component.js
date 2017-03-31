import Ember from 'ember';

const CPU_OPTS = {
  fields: ['cpuUser','cpuSystem'],
  fill: 'cpu',
};

export default Ember.Component.extend({
  model: null,
  mode: 'small',
  smallWidth: 60,
  smallHeight: 25,
  largeTargetId: null,
  linkName: 'containerStats',

  tagName: '',
  cpuOpts: CPU_OPTS,
});
