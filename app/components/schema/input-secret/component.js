import Ember from 'ember';

export default Ember.Component.extend({
  selected: null,  // Selected secret ID
  selectClass: 'form-control',
  exclude: null,  // ID or array of IDs to exclude from list
  valueKey: 'name', // What to set the value as.. 'name' or 'id'

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // name or id output string

  allSecrets: null,

  init() {
    this._super(...arguments);

    this.set('allSecrets', this.get('store').all('secret'));

    let def = this.get('field.default');
    if ( def && !this.get('selected') ) {
      var exact;

      this.get('allSecrets').forEach((secret) => {
        if ( def === secret.get('name') )
        {
          exact = secret.get('id');
        }
      });

      this.set('selected', exact || null);
    }
  },

  filtered: function() {
    let list = this.get('allSecrets');

    let exclude = this.get('exclude');
    if ( exclude ) {
      if ( !Ember.isArray(exclude) ) {
        exclude = [exclude];
      }

      list = list.filter(x => !exclude.includes(x.id));
    }

    return list.sortBy('name','id');
  }.property('allSecrets.[]','exclude.[]'),

  selectedChanged: function() {
    let id = this.get('selected');
    let str = null;

    if ( id ) {
      let secret = this.get('store').getById('secret',id);
      if ( secret ) {
        str = secret.get(this.get('valueKey'));
      }
    }

    this.set('value', str);
  }.observes('selected'),
});
