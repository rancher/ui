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

deployment: `apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: ""
spec:
  replicas: 2
  template:
    metadata:
      labels:
    spec:
      containers:
      - name: ""
        image: ""
        ports:
`,

replicaset: `apiVersion: extensions/v1beta1
kind: ReplicaSet
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

    var fn;
    switch ( kind )
    {
      case 'namespace':
        fn = k8s.getNamespace;
        break;
      case 'deployment':
        fn = k8s.getDeployment;
        break;
      case 'service':
        fn = k8s.getService;
        break;
      case 'replicaset':
        fn = k8s.getReplicaSet;
        break;
      case 'replicationcontroller':
        fn = k8s.getRC;
        break;
      case 'pod':
        fn = k8s.getPod;
        break;
      case 'deployment':
        fn = k8s.getDeployment;
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
          label: 'k8sTab.types.'+kind,
        });
      });
    }
    else
    {
      return Ember.Object.create({
        body: TEMPLATES[kind].replace('%NAMESPACE%', ns),
        editing: false,
        label: 'k8sTab.types.'+kind,
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
