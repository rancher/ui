import Router from '@ember/routing/router';

export function initialize() {
  const isEmbedded = window !== window.top;

  let stylesheet = null;

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
          target: transition.targetName,
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
      } else if (msg.action === 'colors') {
        const head = document.getElementsByTagName('head')[0];

        // Inject stylesheet to customize some colors
        if (stylesheet) {
          head.removeChild(stylesheet);
        }

        let css = `.bg-primary { background-color: ${ msg.primary }; color: ${ msg.primaryText } }\n `;

        css += `.ember-basic-dropdown-content > li > a:hover {background-color: ${ msg.primary }; color: ${ msg.primaryText } }\n `;
        css += `.ember-basic-dropdown-content > li > a:focus {background-color: ${ msg.primary }; color: ${ msg.primaryText } }\n `;

        stylesheet = document.createElement('style');
        stylesheet.setAttribute('type', 'text/css');
        stylesheet.appendChild(document.createTextNode(css));
        head.appendChild(stylesheet);
      }
    });
  }
}

export default {
  name: 'route-spy',
  initialize,

};
