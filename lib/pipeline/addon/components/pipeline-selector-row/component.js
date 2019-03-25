import Component from '@ember/component';
import { get } from '@ember/object'
import layout from './template';
import { observer, set } from '@ember/object';

const typeChoices = [{
  label: 'pipelineSelector.branch',
  value: 'branch',
}, {
  label: 'pipelineSelector.event',
  value: 'event',
}];

const eventChoices = [{
  label: 'pipelineSelector.pr',
  value: 'pull_request',
}, {
  label: 'pipelineSelector.push',
  value: 'push',
}, {
  label: 'pipelineSelector.tag',
  value: 'tag',
}];

export default Component.extend({
  layout,
  tagName: 'TR',
  rule:    null,
  typeChoices,
  eventChoices,

  actions: {
    removeRule() {
      this.remove(this.rule);
    },
  },

  ruleKeyDidChange: observer('rule.key', function() {
    if ( get(this, 'rule.key') === 'event' ) {
      set(this, 'rule.value', eventChoices[0].value);
    } else {
      set(this, 'rule.value', '');
    }
  }),

  remove() {
    throw new Error('remove action is required!');
  }
})
