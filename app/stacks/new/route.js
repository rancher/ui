import Ember from 'ember';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

const DOCKER = 'docker-compose.yml';
const RANCHER = 'rancher-compose.yml';

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
      type: 'stack',
      startOnCreate: true,
    });

    var dockerUrl = null;
    var rancherUrl = null;

    if ( params.githubRepo )
    {
      // Load compose files from GitHub
      dockerUrl = githubUrl(params.githubRepo, params.githubBranch, DOCKER);
      rancherUrl = githubUrl(params.githubRepo, params.githubBranch, RANCHER);
    }
    else if ( params.composeFiles )
    {
      // Load compose files from arbitrary base URL
      var base = params.composeFiles.replace(/\/+$/,'');
      dockerUrl = base + '/' + DOCKER;
      rancherUrl = base + '/' + RANCHER;
    }

    if ( dockerUrl && rancherUrl )
    {
      return Ember.RSVP.hashSettled({
        docker:  ajaxPromise({url: dockerUrl,  dataType: 'text'}, true),
        rancher: ajaxPromise({url: rancherUrl, dataType: 'text'}, true),
      }).then((hash) => {
        if ( hash.docker.state === 'fulfilled' )
        {
          stack.set('dockerCompose', hash.docker.value);
        }

        if ( hash.rancher.state === 'fulfilled' )
        {
          stack.set('rancherCompose', hash.rancher.value);
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
        composeFiles: null,
        system: false,
      });
    }
  },

  actions: {
    cancel: function() {
      this.transitionTo('stacks');
    },
  }
});
