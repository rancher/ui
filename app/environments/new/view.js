import Ember from 'ember';
import { addAction } from 'ui/utils/add-view-action';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.View.extend(SelectTab, {
  actions: {
    addHost: addAction('addHost', '.lb-host'),
    addTargetContainer: addAction('addTargetContainer', '.lb-target'),
    addTargetIp: addAction('addTargetIp', '.lb-target'),
    addListener: addAction('addListener', '.lb-listener-source-port'),
  },

});
