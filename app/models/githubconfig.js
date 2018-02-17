import Resource from 'ember-api-store/models/resource';
import { arrayOfReferences } from 'ember-api-store/utils/denormalize';

var GithubConfig = Resource.extend({
  type: 'githubConfig',
  allowedPrincipals: arrayOfReferences('allowedPrincipalIds', 'principal'),
});

export default GithubConfig;
