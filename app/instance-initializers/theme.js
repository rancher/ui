import Ember from 'ember';
import C from 'ui/utils/constants';

export function initialize(instance) {
  var container = instance.container;
  var session   = container.lookup('service:session');
  var theme     = session.get(C.PREFS.THEME);
  var userTheme = container.lookup('service:user-theme');

  if (theme) {

    if (theme === 'ui-auto') {
      userTheme.setAutoUpdate();
    } else {
      Ember.$('link[rel="stylesheet"]').after(`<link rel="stylesheet" href="assets/${theme}.css">`);
    }

  } else {

    theme = 'ui-light';

    session.set(C.PREFS.THEME, theme);

    Ember.$('link[rel="stylesheet"]').after(`<link rel="stylesheet" href="assets/${theme}.css">`);

  }

}

export default {
  name: 'theme',
  initialize: initialize
};
