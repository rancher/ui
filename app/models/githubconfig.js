import Resource from 'ember-api-store/models/resource';
import { arrayOfReferences } from 'ember-api-store/utils/denormalize';

var GithubConfig = Resource.extend({
  type: 'githubConfig',
  // TODO WJW - technically this works but we can't get external principals because we currently have no `action=search` by ids for principals
  allowedPrincipals: arrayOfReferences('allowedPrincipalIds', 'principal'),
});

export default GithubConfig;
