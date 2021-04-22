import Router from '@ember/routing/router';

export function initialize(application) {
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
        window.top.postMessage({
          action: 'before-navigation',
          target: transition.targetName
        })
      }.on('willTransition')
    });

    // Add listener for post messages to change the route in the application
    window.addEventListener('message', (event) => {
      const msg = event.data || {};

      // Navigate when asked to
      if (msg.action === 'navigate') {
        const router = window.ls('router');

        // If the route being asked for is already loaded, then
        if (router.currentRouteName === msg.name) {
          window.top.postMessage({
            action: 'did-transition',
            url:    router.urlFor(msg.name)
          })
        }

        router.transitionTo(msg.name);
      }
    });
  }
}

export default {
  name: 'route-spy',
  initialize,

};
