// https://github.com/ef4/ember-browserify#the-workaround
import Marked from 'npm:marked'; // eslint-disable-line no-unused-vars
import DOMPurify from 'npm:dompurify'; // eslint-disable-line no-unused-vars
import Component from '@ember/component';
import layout from './template';

import { htmlSafe } from '@ember/string';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,
  markdown:       null,
  parsedMarkdown: computed('markdown', function() {
    const html = Marked(get(this, 'markdown'));

    return htmlSafe(DOMPurify.sanitize(html));
  })
});
