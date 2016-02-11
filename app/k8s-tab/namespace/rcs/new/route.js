import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    var rc = this.get('store').createRecord({
      type: 'kubernetesReplicationController',
      environmentId: this.modelFor('k8s-tab.namespace').get('id'),
      name: '',
      description: '',
      template: {
        spec: { // rcSpec
          replicas: 1,
          selector: {},
          template: {
            spec: { // podSpec
              volumes: [],
              containers: [
                {
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
                  livenessProbe: {},
                  readinessProbe: {},
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
                },
              ],
              restartPolicy: 'Always',
              terminationGracePeriodSeconds: 30,
              activeDeadlineSeconds: null,
              dnsPolicy: 'ClusterFirst',
              nodeSelector: '',
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
