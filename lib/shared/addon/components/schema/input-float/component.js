import { alias } from '@ember/object/computed';
import layout from './template';
import InputNumber from 'shared/components/input-number/component';

export default InputNumber.extend({
  layout,

  classNames: ['form-control'],

  max: alias('field.max'),
  min: alias('field.min'),
});
