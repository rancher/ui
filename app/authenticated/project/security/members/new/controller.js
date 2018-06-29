import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { get } from '@ember/object';
import { computed } from '@ember/object';

const ROLE_KINDS = [
  { id: 'User', },
  { id: 'Group', },
  // {
  //   id: 'Service Account',
  // },
  // {
  //   id: 'Principle',
  // },
]

export default Controller.extend(NewOrEdit, {
  primaryResource: null,
  kinds:           ROLE_KINDS,
  filteredUsers:   computed('model.users.@each.{id,state}', function() {

    return get(this, 'model.users').filter((u) => !u.hasOwnProperty('me') || get(u, 'me') === false)
      .sortBy('username');

  }),
  actions: {
    doneSaving() {

      this.transitionToRoute('authenticated.project.security.members.index', get(this, 'model.project.id'))

    },
  },
});
