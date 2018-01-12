import { on } from '@ember/object/evented';
import Component from '@ember/component';
import layout from './template'
import { inject as service } from '@ember/service'
import { observer } from '@ember/object'
import { run } from '@ember/runloop';

const NONE            = 'none';
const INCOMPLETE      = 'incomplete';
const ERROR           = 'error';
const NOTCONFIGURED   = 'notConfigured';
const CONFIGURED      = 'configured';
const COUNTCONFIGURED = 'countConfigured';
const STANDARD        = 'standard';
const SPECIFIC        = 'specific';
const CUSTOM          = 'custom';
const RULE            = 'rule';
const ANY             = 'any';

export const STATUS = {
  NONE,
  INCOMPLETE,
  ERROR,
  NOTCONFIGURED,
  CONFIGURED,
  COUNTCONFIGURED,
  STANDARD,
  CUSTOM,
  SPECIFIC,
  RULE,
  ANY
}

export const STATUS_INTL_KEY = 'accordionRow.status';

export function classForStatus(status) {
  switch (status) {
    case NONE:
    case NOTCONFIGURED:
    case STANDARD:
    case ANY:
      return 'text-muted';
    case INCOMPLETE:
    case ERROR:
      return 'text-error';
    default:
      return 'text-success';
  }
}

export default Component.extend({
  layout,
  scope:     service(),

  classNames:   ['accordion'],

  name:         null,
  title:        null,
  detail:       null,
  status:       null,
  statusClass:  null,
  showStatue:   true,

  intent:       null,
  showExpand:   true,
  expandOnInit: false,

  expanded:     false,
  expandAll:    false,
  everExpanded: false,

  expand() {
  },

  init() {
    this._super(...arguments);
    run.scheduleOnce('render', () => {
      let eoi = this.get('expandOnInit');
      if (eoi) {
        if (!this.get('everExpanded')) {
          this.set('everExpanded', true);
        }
        run.next(() => {
          this.set('expanded', eoi);
        });
      }
    });
  },
  expdObserver: on('init', observer('expanded', function() {
    if (this.get('expanded') && !this.get('intent')) {
      if (!this.get('everExpanded')) {
        this.set('everExpanded', true);
      }
      run.next(() => {
        this.set('intent', this.get('componentName'));
      });
    }
  })),

  expandAllObserver: on('init', observer('expandAll', function() {
    var ea = this.get('expandAll');
    if (ea) {
      this.set('expanded', true);
    } else {
      this.set('expanded', false);
    }
  })),
});
