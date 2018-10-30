import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { get } from '@ember/object';
// import { all as PromiseAll } from 'rsvp';

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
  actions:         {
    doneSaving() {
      this.transitionToRoute('authenticated.cluster.security.members.index', get(this, 'model.cluster.id'))
    },
  },
});
