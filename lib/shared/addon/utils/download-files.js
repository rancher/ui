import fetchYaml from 'shared/utils/fetch-yaml';
import { addQueryParam } from 'shared/utils/util';
import { saveAs } from 'file-saver';

export function downloadFile(fileName, content, contentType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: contentType });

  saveAs(blob, fileName);
}
