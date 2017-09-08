import Ember from 'ember';
import AccountController from '../account/controller';

export default AccountController.extend({
  arranged: Ember.computed('model.environment.@each.{accountId,name,createdTs}','sortBy','descending', function() {
    var project = this.get('project.id');
    let sort    = (Ember.get(this.get('headers').findBy('name', this.get('sortBy')), 'sort')||[]);

    let out = this.get('model.environment').filter((row) => {
      return row.get('accountId') === project;
    }).sortBy(...sort);

    if ( this.get('descending') ) {
      out = out.reverse();
    }

    return out;
  }),
});
