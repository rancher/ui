export default function initializeStoreService(application) {
  var container = application.lookup ? application : application.container;
  container.lookup('service:store');
}
