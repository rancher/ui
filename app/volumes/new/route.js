import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params/*, transition*/) {
    var store = this.get('store');

    var dependencies = {
      stacks: store.find('stack'),
    };

    if ( params.volumeId )
    {
      dependencies['volume'] = store.find('volume', params.volumeId);
    }
    else if ( params.volumeTemplateId )
    {
      dependencies['volumeTemplate'] = store.find('volumeTemplate', params.volumeTemplateId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      let out;
      let scope = 'global';
      if ( results.hasOwnProperty('volume') ) {
        out = results.volume.serializeForNew();
      } else if ( results.hasOwnProperty('volumeTemplate') ) {
        out = results.volume.serializeForNew();
        if ( out.perContainer ) {
          scope = 'container';
        } else {
          scope = 'service';
        }
      } else {
        out = {}
      }

      if ( !out.driverOpts ) {
        out.driverOpts = {}
      }

      let stack;

      // User-supplied
      if ( out.stackId ) {
        stack = results.stacks.findBy('id', out.stackId);
      }

      return EmberObject.create({
        scope: scope,
        config: out,
        stack: stack,
      });
    });
  },

  resetController: function (controller, isExisting/*, transition*/) {
    if (isExisting)
    {
      controller.set('volumeId', null);
      controller.set('volumeTemplateId', null);
    }
  },
});
