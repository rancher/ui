import { helper } from '@ember/component/helper';

export function hasOverride(params, hash) {
  const { questions, paramName } = hash;
  let match                      = null;

  if (!questions) {
    return false;
  } else {
    match = questions.findBy('variable', paramName);

    if (match) {
      return true;
    } else {
      return false;
    }
  }
}

export default helper(hasOverride);
