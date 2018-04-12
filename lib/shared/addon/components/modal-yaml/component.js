import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import CodeMirror from 'codemirror';
import jsyaml from 'npm:js-yaml';
import ModalBase from 'shared/mixins/modal-base';
import fetchYaml from 'shared/utils/fetch-yaml';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  errors:     null,
  editing:   false,
  compose:   null,
  intl:              service(),
  classNames: ['modal-container', 'large-modal', 'fullscreen-modal'],
  resource: alias('modalService.modalOpts.resource'),
  model: null,
  type: function (argument) {
    let resource = this.get('model.resource');
    if(resource){
      return ` ${resource.type} `;
    }
    return ' ';
  }.property('model.resource'),
  mode: function () {
    let resource = this.get('model.resource');
    if(resource){
      return 'Edit';
    }
    return 'Import';
  }.property('model.resource'),
  createLabel: function (argument) {
    let resource = this.get('model.resource');
    if(resource){
      return 'generic.save';
    }
    return 'generic.add';
  }.property('model.resource'),
  name: function (argument) {
    let resource = this.get('model.resource');
    if(resource){
      return resource.name + '.yaml';
    }
    return 'kubenetes.yaml';
  }.property('model.resource'),
  files:     null,
  growl: service(),
  scope: service(),
  store:         service('store'),
  init() {
    this._super(...arguments);
    window.jsyaml||(window.jsyaml=jsyaml);
    let resource = this.get('resource');
    if(resource && resource.links.yaml){
      let yamlLink = resource.links.yaml
      return fetchYaml(yamlLink)
        .then(yaml => {
          this.set('model', {
            resource,
            yaml
          });
        })
    }else
    this.set('model', {
      resource,
      yaml: ''
    });
  },
  yamlObserve: function () {
    let yaml = this.get('model.yaml');
    CodeMirror.lint.yaml(yaml);
  }.observes('model.yaml'),
  actions: {
    save: function(success){
      let model = this.get('model');
      let lintError = CodeMirror.lint.yaml(model.yaml);

      if(lintError.length){
        this.set('errors', [this.get('intl').t('yamlPage.errors')]);
        success(false);
        return
      }
      this.set('errors', null);
      let resource = model.resource;
      if(resource){
        this.get('store').request({
          data: JSON.stringify(jsyaml.load(model.yaml)),
          url: resource.links.yaml,
          method: 'PUT'
        }).then(data =>{
          this.send('cancel');
        }).catch(()=>{
          success(false);
        })
        return
      }
    }
  },

});
