import Component from '@ember/component';
import layout from './template';
import { equal, or } from '@ember/object/computed'
import { VIEW, NEW, EDIT } from 'shared/mixins/view-new-edit';

export default Component.extend({
  layout,
  tagName: '',

  mode:            null,
  scope:           null,
  namespace:       null,
  model:           null,
  namespaceErrors: null,

  isView:  equal('mode', VIEW),
  isNew:   equal('mode', NEW),
  isEdit:  equal('mode', EDIT),
  notView: or('isNew', 'isEdit'),

});
