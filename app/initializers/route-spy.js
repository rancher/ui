import Router from '@ember/routing/router';

export function initialize() {
  const isEmbedded = window !== window.top;

  if (isEmbedded) {
    Router.reopen({
      notifyTopFrame: function() {
        window.top.postMessage({
          action: 'did-transition',
          url:    this.currentURL
        })
      }.on('didTransition'),

      willTranstionNotify: function(transition) {
        const router = window.ls('router');
        let url;

        if (transition.targetName && transition.to) {
          try {
            url = router.urlFor(transition.targetName, transition.to.params );
          } catch (e) {}
        }

        window.top.postMessage({
          action: 'before-navigation',
          target: transition.targetName,
          url
        })
      }.on('willTransition')
    });

    // Add listener for post messages to change the route in the application
    window.addEventListener('message', (event) => {
      const msg = event.data || {};

      // Navigate when asked to
      if (msg.action === 'navigate') {
        const router = window.ls('router');

        // If the route being asked for is already loaded, send a did-transition event
        if (router.currentRouteName === msg.name) {
          window.top.postMessage({
            action: 'did-transition',
            url:    router.urlFor(msg.name)
          })
        }

        router.transitionTo(msg.name);
      } else if (msg.action === 'set-theme') {
        const userTheme = window.ls('userTheme');

        if (userTheme) {
          userTheme.setTheme( msg.name, false);
        }
      }
    });
  }
}

export default {
  name: 'route-spy',
  initialize,

};
