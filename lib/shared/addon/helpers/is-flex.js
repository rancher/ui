import { helper } from '@ember/component/helper';

export function isFlex(params) {
  return params[0].includes('Flex')
}

export default helper(isFlex);
