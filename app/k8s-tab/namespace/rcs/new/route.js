import Ember from 'ember';

export function emptyContainer() {
  return {
    name: '',
    image: '',
    command: [],
    args: [],
    workingDir: '',
    ports: [],
    env: [],
    resources: {
      limits: null,
      requests: null,
    },
    volumeMounts: [],
    livenessProbe: null,
    readinessProbe: null,
    lifecycle: null,
    terminationMessagePath: "/dev/termination-log",
    imagePullPolicy: '', // Always, Never, IfNotPresent
    securityContext: {
      capabilities: {
        add: [],
        drop: [],
      },
      privileged: false,
      seLinuxOptions: {
        user: '',
        role: '',
        type: '',
        level: '',
      },
      runAsUser: null,
      runAsNonRoot: false,
    },
    stdin: false,
    stdinOnce: false,
    tty: false,
  };
}

export default Ember.Route.extend({
  model() {
    var rc = this.get('store').createRecord({
      type: 'kubernetesReplicationController',
      environmentId: this.modelFor('k8s-tab.namespace').get('id'),
      name: '',
      description: '',
      template: { //rcTemplate
        apiVersion: "v1",
        kind: "ReplicationController",
        spec: { // rcSpec
          replicas: 1,
          selector: null,
          template: { // podTemplate
            metadata: {
              labels: {},
            },
            spec: { // podSpec
              volumes: [],
              containers: [
                emptyContainer(),
              ],
              restartPolicy: 'Always',
              terminationGracePeriodSeconds: 30,
              activeDeadlineSeconds: null,
              dnsPolicy: 'ClusterFirst',
              nodeSelector: null,
              serviceAccountName: '',
              nodeName: '',
              hostNetwork: false,
              hostPID: false,
              hostIPC: false,
              imagePullSecrets: [],
            },
          },
        },
      },
    });

    return Ember.Object.create({
      rc: rc,
    });
  }
});
