import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  currentTarget: computed.reads('originalModel.targetType'),

  hasCurrentTarget: function() {

    const ol = this.get('originalModel');

    if (!ol) {

      return false

    }
    const currentTarget = this.get('currentTarget');

    return  currentTarget && currentTarget !== 'none';

  }.property('currentTarget'),

  targets: function() {

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
        type:       'embedded',
        // label: 'loggingPage.targetTypes.embedded',
        css:        `embedded${   this.currentCss('embedded') }`,
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
        label:     '',
        css:       `splunk${   this.currentCss('splunk') }`,
        available: true,
        disabled:  false,
      },
      {
        type:      'kafka',
        label:     '',
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
    ].filter((item) => {

      return this.get('isClusterLevel') || item.type !== 'embedded';

    });

  }.property('isClusterLevel', 'currentTarget'),
  currentCss(type) {

    return this.get('hasCurrentTarget') && type === this.get('currentTarget') ? ' current' : '';

  },

});
