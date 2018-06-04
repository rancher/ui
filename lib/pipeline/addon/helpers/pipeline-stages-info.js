import Helper from '@ember/component/helper';
import C from 'shared/utils/pipeline-constants';
import { get } from '@ember/object';

function stepStypeMapper(step){
  if (step.sourceCodeConfig){
    return 'clone';
  }
  const found = C.STEP_TYPES.find((stepType) => {
    if ( get(step, stepType.name) ) {
      return true;
    }
  });

  return found ? found.label : '';
}

function stagesInfo() {
  var arg = arguments[0];

  if (arg[2] === false){
    return arg[0][arg[1]][arg[3]];
  }

  return stepStypeMapper(arg[0][arg[1]].steps[arg[2]]);
}
export default Helper.helper(stagesInfo);
