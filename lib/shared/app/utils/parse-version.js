// https://github.com/ef4/ember-browserify#the-workaround
import Semver from 'npm:semver'; // eslint-disable-line no-unused-vars
export {
  satisfies, parse, comparePart, compare, minorVersion
} from 'shared/utils/parse-version';
