import Ember from 'ember';
import C from 'ui/utils/constants';

const notUser = [C.EXTERNALID.KIND_KUBERNETES, C.EXTERNALID.KIND_SYSTEM];

export default Ember.Route.extend({
  queryParams: {
    which: {
      refreshModel: true
    },
  },

  actions: {
    willTransition: function() {
      this.controller.set('showAddtlInfo', null);
    },
  },

  model: function(params) {
    var all = this.modelFor('environments');
    var out;

    var kubernetes = all.filterBy('externalIdInfo.kind', C.EXTERNALID.KIND_KUBERNETES);
    var system     = all.filterBy('externalIdInfo.kind', C.EXTERNALID.KIND_SYSTEM);
    var user       = all.filter((obj) => {
        return notUser.indexOf(obj.get('externalIdInfo.kind')) === -1;
      });

    if ( params.which === C.EXTERNALID.KIND_ALL )
    {
      out = all;
    }
    else if ( params.which === C.EXTERNALID.KIND_KUBERNETES )
    {
      out = kubernetes;
    }
    else if ( params.which === C.EXTERNALID.KIND_SYSTEM )
    {
      out = system;
    }
    else
    {
      out = user;
    }

    return {
      current: out,
      hasKubernetes: kubernetes.get('length') > 0,
      hasSystem: system.get('length') > 0,
    };
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('showAddtlInfo', false);
    }
  },
});
