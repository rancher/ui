import Component from '@ember/component';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';
import { get } from '@ember/object';

export default Component.extend({
  branchCondition: function(){
    let condition = get(this, 'model.sourceCodeConfig.branchCondition');

    if (condition){
      let conditionEnum = branchConditionsEnums.find((ele) => ele.value === condition)

      return conditionEnum && conditionEnum.label || '';
    }

    return '';
  }.property('model.sourceCodeConfig.branchCondition')
});
