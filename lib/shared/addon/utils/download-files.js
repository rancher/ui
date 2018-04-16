import fetchYaml from 'shared/utils/fetch-yaml';
import { all } from 'rsvp';

export function downloadFiles(name, content) {
  if(typeof content === 'string'){
    var blob = new Blob([content], {
     type: "text/plain;charset=utf-8"
    });
    window.saveAs(blob, name);
  }
  else{
    var zip = new window.JSZip();
    for (var i = 0; i < content.length; i++) {
      let file = content[i];
      zip.file(file.name, file.file);
    }
    zip.generateAsync({type:"blob"})
    .then(function(contents) {
        // see FileSaver.js
        window.saveAs(contents, name);
    });
  }
}

export function downloadResourceYaml(resources){
  if(!resources.length){
    return
  }

  if(resources.length <= 1){
    let resource = resources[0];

    let yamlLink = resource.links.yaml
    if(!yamlLink){
      return
    }

    fetchYaml(yamlLink)
      .then(yaml =>{
        downloadFiles(resource.name + '.yaml', yaml);
      })
  }else{
    let hashRequest = [];

    for (var i = 0; i < resources.length; i++) {
      let resource = resources[i];
      let yamlLink = resource.links.yaml
      if(!yamlLink){
        continue
      }
      hashRequest.push(fetchYaml(yamlLink));
    }

    all(hashRequest)
      .then(data =>{
        let zipData = data.map((ele, index)=>{
          return {
            name: resources[index].name + '.yaml',
            file: ele
          }
        });
        downloadFiles(resources[0].type + '.zip', zipData);
      })
  }
}
