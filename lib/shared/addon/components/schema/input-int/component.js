import { alias } from '@ember/object/computed';
import layout from './template';
import InputInteger from 'shared/components/input-integer/component';

export default InputInteger.extend({
  layout,

  classNames: ['form-control'],

  max: alias('field.max'),
  min: alias('field.min'),
});
