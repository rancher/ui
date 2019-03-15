import Component from '@ember/component';
import layout from './template';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,

  tagName:    'tr',
  classNames: ['main-row'],
  entry:      null,

  multiClusterAppTargets: computed('entry.multiClusterApp.targets.@each.{projectId,clusterId}', function() {
    return get(this, 'entry.multiClusterApp.targets')
  }),
});
