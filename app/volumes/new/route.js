import Ember from 'ember';

export default Ember.Route.extend({
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

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      let out;
      if ( results.hasOwnProperty('volume') ) {
        out = results.volume.serializeForNew();
      } else if ( results.hasOwnProperty('volumeTemplate') ) {
        out = results.volume.serializeForNew();
        if ( out.perContainer ) {
          out.scope = 'container';
        } else {
          out.scope = 'service';
        }
      } else {
        out = {
          scope: 'global',
        }
      }

      if ( !out.driverOpts ) {
        out.driverOpts = {}
      }

      let stack;

      // User-supplied
      if ( out.stackId ) {
        stack = results.stacks.findBy('id', out.stackId);
      }

      // Default
      if ( !stack ) {
        stack = results.stacks.findBy('isDefault', true);
      }

        if ( existing ) {
          
        }
        if ( params.stackId ) {
          out.stackId = params.stackId;
        } else if ( defaultStack ) {
          out.stackId = defaultStack.get('id');
        }
      }


      return Ember.Object.create({
        config: out,
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
