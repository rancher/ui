import { saveAs } from 'file-saver';

export function downloadFile(fileName, content, contentType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: contentType });

  saveAs(blob, fileName);
}
