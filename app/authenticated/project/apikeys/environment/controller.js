import AccountController from '../account/controller';

export default AccountController.extend({
  arranged: function() {
    var project = this.get('project.id');
    let sort = this.get('sorts')[this.get('sortBy')];

    let out = this.get('model.environment').filter((row) => {
      return row.get('accountId') === project;
    }).sortBy(...sort);

    if ( this.get('descending') ) {
      out = out.reverse();
    }

    return out;
  }.property('model.environment.@each.{accountId,name,createdTs}','sortBy','descending'),
});
