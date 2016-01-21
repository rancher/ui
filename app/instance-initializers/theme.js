import C from 'ui/utils/constants';

export function initialize(instance) {
  var container   = instance.container;
  var session     = container.lookup('service:session');
  var userTheme   = container.lookup('service:user-theme');
  var theme       = session.get(C.PREFS.THEME);

  if (theme) {

    if (theme === 'ui-auto') {
      userTheme.setAutoUpdate();
    } else {
      userTheme.writeStyleNode(theme);
    }

  } else {

    theme = C.THEME.DEFAULT;

    userTheme.writeStyleNode(theme);

    session.set(C.PREFS.THEME, theme);

  }

}

export default {
  name: 'theme',
  initialize: initialize
};
