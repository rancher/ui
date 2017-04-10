import Ember from 'ember';

const NONE = 'none';
const INCOMPLETE = 'incomplete';
const ERROR = 'error';
const NOTCONFIGURED = 'notConfigured';
const CONFIGURED = 'configured';
const COUNTCONFIGURED = 'countConfigured';
const STANDARD = 'standard';
const CUSTOM = 'custom';

export const STATUS = {
  NONE,
  INCOMPLETE,
  ERROR,
  NOTCONFIGURED,
  CONFIGURED,
  COUNTCONFIGURED,
  STANDARD,
  CUSTOM
}

export const STATUS_INTL_KEY = 'accordionRow.status';

export function classForStatus(status) {
  switch (status) {
    case NONE:
    case NOTCONFIGURED:
    case STANDARD:
      return 'text-muted';
    case INCOMPLETE:
    case ERROR:
      return 'text-bold text-error';
    default:
      return 'text-bold text-success';
  }
}

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  name: null,
  title: null,
  detail: null,
  status: null,
  statusClass: null,

  classNames: ['accordion'],
  expanded: false,

  actions: {
    toggle() {
      this.toggleProperty('expanded');
    },
  },
});
