import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName: '',
  hostTemplateChoices: computed('hostTemplates', function() {
    return this.get('hostTemplates').map((tmpl) => {
      return {label: tmpl.get('name'), value: tmpl.get('id')};
    })
  })
});
