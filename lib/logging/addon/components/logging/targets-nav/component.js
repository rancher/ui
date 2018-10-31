import Component from '@ember/component';
import { computed, get } from '@ember/object';

export default Component.extend({

  currentTarget: computed('originalModel.targetType', function() {
    const targetType = get(this, 'originalModel.targetType')

    return targetType === 'fluentForwarder' ? 'fluentd output forward' : targetType
  }),

  targetTypeName: computed('targetType', function() {
    const targetType = get(this, 'targetType')

    return targetType === 'fluentForwarder' ? 'fluentd output forward' : targetType
  }),

  hasCurrentTarget: function() {
    const ol = this.get('originalModel');

    if (!ol) {
      return false
    }
    const currentTarget = this.get('currentTarget');

    return  currentTarget && currentTarget !== 'none';
  }.property('currentTarget'),

  targets: computed('isClusterLevel', 'currentTarget', function() {
    return [
      {
        type:       'none',
        label:      'loggingPage.targetTypes.disable',
        css:        `none${   this.currentCss('none') }`,
        classNames: '',
        available:  true,
        disabled:   false,
      },
      {
        type:      'elasticsearch',
        label:     'loggingPage.targetTypes.elasticsearch',
        css:       `elasticsearch${   this.currentCss('elasticsearch') }`,
        available: true,
        disabled:  false,
      },
      {
        type:      'splunk',
        label:     'loggingPage.targetTypes.splunk',
        css:       `splunk${   this.currentCss('splunk') }`,
        available: true,
        disabled:  false,
      },
      {
        type:      'kafka',
        label:     'loggingPage.targetTypes.kafka',
        css:       `kafka${   this.currentCss('kafka') }`,
        available: true,
        disabled:  false,
      },
      {
        type:      'syslog',
        label:     'loggingPage.targetTypes.syslog',
        css:       `syslog${   this.currentCss('syslog') }`,
        available: true,
        disabled:  false,
      },
      {
        type:      'fluentForwarder',
        label:     'loggingPage.targetTypes.fluentd',
        css:       `fluentd${   this.currentCss('fluentd') }`,
        available: true,
        disabled:  false,
      },
    ];
  }),

  currentCss(type) {
    return this.get('hasCurrentTarget') && type === this.get('currentTarget') ? ' current' : '';
  },

});
