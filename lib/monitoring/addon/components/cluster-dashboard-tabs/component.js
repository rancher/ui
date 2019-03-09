import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  scope:    service(),
  settings: service(),
  grafana:  service(),

  layout,
  classNames: 'row',

  largeScale: computed('scope.currentCluster.nodes.length', function() {
    return get(this, 'scope.currentCluster.nodes.length') > 10;
  }),
});
