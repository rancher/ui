import { computed, get } from '@ember/object';
import AccountController from '../account/controller';

export default AccountController.extend({
  arranged: computed('model.environment.@each.{accountId,name,createdTs}','sortBy','descending', function() {
    var project = this.get('project.id');
    let sort    = (get(this.get('headers').findBy('name', this.get('sortBy')), 'sort')||[]);

    let out = this.get('model.environment').filter((row) => {
      return row.get('accountId') === project;
    }).sortBy(...sort);

    if ( this.get('descending') ) {
      out = out.reverse();
    }

    return out;
  }),
});
