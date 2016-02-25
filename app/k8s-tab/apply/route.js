import Ember from 'ember';

const TEMPLATES = {
  namespace: `apiVersion: v1
kind: Namespace
metadata:
  name: ""
spec:
  finalizers:
`,

  service: `apiVersion: v1
kind: Service
metadata:
  name:
  namespace: "%NAMESPACE%"
  labels:
spec:
  ports:
  - name: ""
    port:
    protocol: TCP
    targetPort:
  selector:
`,

  replicationcontroller: `apiVersion: v1
kind: ReplicationController
metadata:
  labels:
  name: ""
  namespace: "%NAMESPACE%"
spec:
  replicas: 2
  selector:
  template:
    metadata:
      labels:
    spec:
      restartPolicy: Always
      containers:
      - image: ""
        imagePullPolicy: Always
        name: ""
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
    var ns = k8s.get('namespace.metadata.name')||'';
    var kind = (params.kind||'').toLowerCase();

    var fn, label;
    switch ( kind )
    {
      case 'namespace':
        fn = k8s.getNamespace;
        label = 'Namespace';
        break;
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
      return this.get('k8s').getYaml(kind, params.name, ns).then((yaml) => {
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
        body: TEMPLATES[kind].replace('%NAMESPACE%', ns),
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
