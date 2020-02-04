export function initialize(application) {
  const errorHandler = (message, file, line, column, error) => {
    const router = application.__container__.lookup('router:main');
    const controller = application.__container__.lookup('controller:application');

    controller.setProperties({ error });
    router.transitionTo('failWhale');
  }

  window.onerror = errorHandler;

  window.addEventListener('unhandledrejection', () => {
    errorHandler(null, null, null, null, 'Promise was rejected.');
  });
}

export default {
  name:       'uncaught-exceptions',
  initialize
};
