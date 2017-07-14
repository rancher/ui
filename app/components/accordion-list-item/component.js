import Ember from 'ember';

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

export default Ember.Component.extend({
  projects:     Ember.inject.service(),

  name:         null,
  title:        null,
  detail:       null,
  status:       null,
  statusClass:  null,

  classNames:   ['accordion'],
  expanded:     false,
  expandAll:    false,
  intent:       null,
  expandOnInit: false,
  everExpanded: false,

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('render', () => {
      let eoi = this.get('expandOnInit');
      if (eoi) {
        if (!this.get('everExpanded')) {
          this.set('everExpanded', true);
        }
        Ember.run.next(() => {
          this.set('expanded', eoi);
        });
      }
    });
  },
  expdObserver: Ember.on('init', Ember.observer('expanded', function() {
    if (this.get('expanded') && !this.get('intent')) {
      if (!this.get('everExpanded')) {
        this.set('everExpanded', true);
      }
      Ember.run.next(() => {
        this.set('intent', this.get('componentName'));
      });
    }
  })),

  expandAllObserver: Ember.on('init', Ember.observer('expandAll', function() {
    var ea = this.get('expandAll');
    if (ea) {
      this.set('expanded', true);
    } else {
      this.set('expanded', false);
    }
  })),
});
