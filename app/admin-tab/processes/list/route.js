import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import PolledModel from 'ui/mixins/polled-model';

export default Route.extend(PolledModel, {
  queryParams: {
    which: {
      refreshModel: true
    },
  },

  model: function(params) {
    let filters = {
    };

    let now = moment().utc().format('YYYY-MM-DDTHH:mm:ss')+'Z';
    if ( params.which === 'running' ) {
      filters['runningProcessServerId_notnull'] = 'true';
      filters['endTime_null'] = 'true';
    } else if ( params.which === 'delayed' ) {
      filters['runAfter_gt'] = now;
      filters['endTime_null'] = 'true';
      filters['runningProcessServiceId_null'] = 'true';
    } else if ( params.which === 'ready' ) {
      filters['runAfter_lte'] = now;
      filters['endTime_null'] = 'true';
    } else if ( params.which === 'completed' ) {
      filters['endTime_notnull'] = 'true';
    }

    return this.get('userStore').find('processinstance', null, {
      sortBy: 'id',
      sortOrder: 'desc',
      limit: 1000,
      depaginate: false,
      filter: filters,
      forceReload: true
    }).then((response) => {
      return EmberObject.create({
        processInstances: response,
      });
    });
  },
});
