import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName: '',
  machineTemplateChoices: computed('machineTemplates', function() {
    return this.get('machineTemplates').map((tmpl) => {
      return {label: tmpl.get('name'), value: tmpl.get('id')};
    })
  })
});
