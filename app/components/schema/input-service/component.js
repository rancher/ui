import Ember from 'ember';

export default Ember.Component.extend({
  allServices : Ember.inject.service(),

  field       : null,
  value       : null,

  choices     : null,
  default     : Ember.computed.alias('field.default'),
  loading     : true,

  init() {
    this._super(...arguments);

    this.get('allServices').choices().then((choices) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      var exact, justService;
      var def = this.get('default');

      choices.forEach((service) => {
        service.value = `${service.stackName}/${service.name}`;

        if ( def === service.value )
        {
          exact = service.value;
        }
        else if ( def === service.name )
        {
          justService = service.value;
        }
      });

      // Choose the default if there isn't a value and there was a matching entry
      if ( this.get('value') === undefined )
      {
        this.set('value', exact || justService || null);
      }

      this.setProperties({
        loading: false,
        choices: choices
      });
    });
  },
});
