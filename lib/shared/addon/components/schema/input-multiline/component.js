import TextArea from '@ember/component/text-area';
import layout from './template';

export default TextArea.extend({
  layout,
  classNames: ['form-control', 'text-mono'],
  rows:       3,
});
