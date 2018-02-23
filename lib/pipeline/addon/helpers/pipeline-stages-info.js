import Ember from 'ember';

function stepStypeMapper(step){
  if(step.sourceCodeConfig){
    return 'clone';
  }
  if(step.runScriptConfig){
    return 'runScript';
  }
  if(step.publishImageConfig){
    return 'publishImage';
  }
}

function stagesInfo() {
  var arg = arguments[0];
  if(arg[2]===false){
    return arg[0][arg[1]][arg[3]];
  }
  return stepStypeMapper(arg[0][arg[1]].steps[arg[2]]);
}
export default Ember.Helper.helper(stagesInfo);
