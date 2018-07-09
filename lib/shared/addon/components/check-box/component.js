import Checkbox from '@ember/component/checkbox';

export default Checkbox.extend({
  attributeBindings: ['nodeId'],
  nodeId:            null,
});
