import { ajaxPromise } from '@rancher/ember-api-store/utils/ajax-promise';

export default function fetchYaml(yamlLink){
  return ajaxPromise({
    method:  'GET',
    url:     yamlLink,
    headers: { Accept: 'application/yaml' }
  }).then((data) => {
    return data.xhr.responseText;
  })
}
