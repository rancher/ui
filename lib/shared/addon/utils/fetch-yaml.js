import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';

export default function fetchYaml(yamlLink, yamlOnly = true){
  const params = {
    method:  'GET',
    url:     yamlLink,
  };

  if ( yamlOnly ) {
    params['headers'] = { Accept: 'application/yaml' };
  }

  return ajaxPromise(params).then((data) => {
    return data.xhr.responseText;
  })
}
