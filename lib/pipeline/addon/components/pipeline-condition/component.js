import Component from '@ember/component';
import layout from './template'
import { get, set, observer } from '@ember/object';

export default Component.extend({
  layout,

  type:       null,
  branchOnly: false,
  config:     null,

  include: null,
  exclude: null,

  init() {
    this._super(...arguments);

    const config = this.get('config');
    const include = {
      branch: {},
      event:  {},
    };
    const exclude = {
      branch: {},
      event:  {},
    };

    if ( config ) {
      if ( config.branch ) {
        include.branch.include = config.branch.include;
        exclude.branch.exclude = config.branch.exclude;
      }
      if ( config.event ) {
        include.event.include = config.event.include;
        exclude.event.exclude = config.event.exclude;
      }
    }
    set(this, 'include', include);
    set(this, 'exclude', exclude);
  },

  configDidChange: observer('include', 'exclude', function() {
    const include = get(this, 'include') || {};
    const exclude = get(this, 'exclude') || {};

    const branch = Object.assign({}, include.branch, exclude.branch);
    const event = Object.assign({}, include.event, exclude.event);
    const out = {};

    if ( Object.keys(branch).length ) {
      out.branch = branch;
    }

    if ( Object.keys(event).length ) {
      out.event = event;
    }

    set(this, 'config', Object.keys(out).length ? out : null);
  }),
});
