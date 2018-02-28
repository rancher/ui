import Component from '@ember/component';
import branchConditionsEnums from 'pipeline/utils/branchConditionsEnums';

export default Component.extend({
  branchCondition: function(){
    let condition = this.get('model.sourceCodeConfig.branchCondition');
    if(condition){
      let conditionEnum = branchConditionsEnums.find(ele => ele.value === condition)
      return conditionEnum&&conditionEnum.label||'';
    }
    return '';
  }.property('model.sourceCodeConfig.branch')
});
