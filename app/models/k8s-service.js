import Ember from 'ember';
import K8sResource from 'ui/models/k8s-resource';
import PodSelector from 'ui/mixins/k8s-pod-selector';

var Service = K8sResource.extend(PodSelector, {
});

export default Service;
