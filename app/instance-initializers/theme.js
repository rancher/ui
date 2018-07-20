import C from 'ui/utils/constants';

export function initialize(instance) {
  var session     = instance.lookup('service:session');
  var userTheme   = instance.lookup('service:user-theme');
  var theme       = session.get(C.PREFS.THEME) || C.THEME.DEFAULT;

  userTheme.setTheme(theme, false);
}

export default {
  name:       'theme',
  initialize
};
