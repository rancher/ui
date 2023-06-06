import Component from '@ember/component';
import { get, computed, set } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';
import { isEmbedded } from 'shared/utils/util';

export default Component.extend({
  scope:    service(),
  settings: service(),
  grafana:  service(),

  layout,
  classNames: 'row',

  isEmbedded: false,

  init() {
    this._super(...arguments);

    set(this, 'isEmbedded', isEmbedded());
  },

  largeScale: computed('scope.currentCluster.nodes.length', function() {
    return get(this, 'scope.currentCluster.nodes.length') > 10;
  }),
});
