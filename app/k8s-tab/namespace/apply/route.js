import Ember from 'ember';

const TEMPLATES = {
  service: `apiVersion: v1
kind: Service
metadata:
  name:
  namespace: "%NAMESPACE%"
  labels:
spec:
  type:
  ports:
  selector:
`,

  replicationcontroller: `apiVersion: v1
kind: ReplicationController
metadata:
  name:
  namespace: "%NAMESPACE%"
  labels:
spec:
  type:
  ports:
  selector:
`,

  pod: `apiVersion: v1
kind: Pod
metadata:
  name:
  namespace: "%NAMESPACE%"
  labels:
spec:
  type:
  ports:
  selector:
`,
};

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model(params) {
    var k8s = this.get('k8s');
    var ns = this.modelFor('k8s-tab.namespace');
    var kind = (params.kind||'').toLowerCase();

    var fn, label;
    switch ( kind )
    {
      case 'service':
        fn = k8s.getService;
        label = 'Service';
        break;
      case 'replicationcontroller':
        fn = k8s.getRC;
        label = 'Replication Controller';
        break;
      case 'pod':
        fn = k8s.getPod;
        label = 'Pod';
        break;
      default:
        return Ember.RSVP.reject('Unknown Kind');
    }

    if ( params.name )
    {
      return this.get('k8s').getYaml(kind, params.name, ns.get('id')).then((yaml) => {
        return Ember.Object.create({
          body: yaml,
          editing: true,
          label: label,
        });
      });
    }
    else
    {
      return Ember.Object.create({
        body: TEMPLATES[kind].replace('%NAMESPACE%', ns.get('id')),
        editing: false,
        label: label,
      });
    }
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.setProperties({
        name: null,
        kind: null,
      });
    }
  }
});
