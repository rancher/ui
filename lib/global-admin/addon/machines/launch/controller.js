import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Controller.extend(NewOrEdit, {
  actions: {
    goBack() {
      this.transitionToRoute('machines');
    },
    launch() {},
  }
});
