import Ember from 'ember';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

const DOCKER = 'docker-compose.yml';

function encodeRepo(str) {
  return str.split('/')
    .map((substr) => { return encodeURIComponent(substr); })
    .join('/');
}

function githubUrl(repo,branch,file) {
  return 'https://raw.githubusercontent.com/' +
    encodeRepo(repo) +
    '/' + encodeURIComponent(branch||'master') +
    '/' + encodeURIComponent(file);
}

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var stack = this.get('store').createRecord({
      type: 'composeProject',
    });

    var dockerUrl = null;

    if ( params.githubRepo )
    {
      // Load compose files from GitHub
      dockerUrl = githubUrl(params.githubRepo, params.githubBranch, DOCKER);
    }
    else if ( params.composeFile )
    {
      // Load compose files from arbitrary base URL
      var base = params.composeFile.replace(/\/+$/,'');
      dockerUrl = base + '/' + DOCKER;
    }

    if ( dockerUrl )
    {
      return Ember.RSVP.hashSettled({
        docker:  ajaxPromise({url: dockerUrl,  dataType: 'text'}, true),
      }).then((hash) => {
        if ( hash.docker.state === 'fulfilled' )
        {
          stack.set('template', hash.docker.value);
        }

        return stack;
      });
    }
    else
    {
      return stack;
    }
  },

  setupController: function(controller, model) {
    controller.set('originalModel',null);
    controller.set('model', model);
    controller.initFields();
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.setProperties({
        githubRepo: null,
        githubBranch: null,
        composeFile: null,
      });
    }
  },

  actions: {
    cancel: function() {
      this.transitionTo('environments');
    },
  }
});
