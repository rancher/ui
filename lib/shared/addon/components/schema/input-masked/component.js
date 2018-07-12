import TextField from '@ember/component/text-field';
import layout from './template';

export default TextField.extend({
  layout,
  classNames: ['form-control'],
  type:       'password'
});
