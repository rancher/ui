import Cattle from 'ui/utils/cattle';

var ProjectController = Cattle.TransitioningResourceController.extend({
  icon: function() {
    var icon = 'fa-question-circle';

    switch ( this.get('externalIdType') )
    {
      case 'default': icon = 'fa-home'; break;
      case 'project:github_user': icon = 'fa-github'; break;
      case 'project:github_team': icon = 'fa-users'; break;
      case 'project:github_org': icon = 'fa-building'; break;
    }

    return icon;
  }.property('externalIdType'),

  listIcon: function() {
    if ( this.get('active') )
    {
      return 'fa-check';
    }
    else
    {
      return this.get('icon');
    }
  }.property('icon','active'),

  active: function() {
    return this.get('session.projectId') === this.get('id');
  }.property('session.projectId','id')
});

ProjectController.reopenClass({
});

export default ProjectController;
