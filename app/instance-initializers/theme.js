import Ember from 'ember';
import C from 'ui/utils/constants';

export function initialize(instance) {
  var container   = instance.container;
  var session     = container.lookup('service:session');
  var application = container.lookup('application:main');
  var userTheme   = container.lookup('service:user-theme');
  var theme       = session.get(C.PREFS.THEME);

  if (theme) {

    if (theme === 'ui-auto') {
      userTheme.setAutoUpdate();
    } else {
      Ember.$('#theme').attr('href',`${application.baseAssets}assets/${theme}.css?${application.version}`);
    }

  } else {

    theme = 'ui-light';

    session.set(C.PREFS.THEME, theme);

    Ember.$('#theme').attr('href',`${application.baseAssets}assets/${theme}.css?${application.version}`);

  }

}

export default {
  name: 'theme',
  initialize: initialize
};
