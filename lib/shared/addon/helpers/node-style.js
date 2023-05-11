import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import { get } from '@ember/object';

export default helper(([node, chosenCompartmentId]) => {
  let style = '';

  if (get(node, 'model.id') === chosenCompartmentId) {
    style += 'font-weight:bold;';
  }

  if (get(node, 'model.isSelected')) {
    style += 'background-color: #DCDEE7;';
  }

  return htmlSafe(style);
}, 'model.isSelected', 'model.id', 'chosenCompartmentId');
