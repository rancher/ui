# Execute something and exit if it fails
function runCmd() {
  $@
  if [[ $? -ne 0 ]]; then
  echo "Command: $@ failed" >&2
  exit 2
  fi
}

# Upload specified asset to Google Cloud Storage
# required parameters:
#   service_account_id - ID/name for service account
#   project_name - the Google Cloud project name which owns the Storage bucket
#   version - the upload version
#
# optional parameters:
#   latest - we are uploading 'latest' which requires a some special upload magic
#   upload_source - the directory or file to upload. Defaults to /upload.
#   upload_target - the target gs:// URI for upload. Defaults to gs://<project name>/.
#   service_account_keyfile - key file for service account in JSON format. Defaults to /tmp/keyfile.json.
#   is_latest -  flag that this is the latest version which changes the upload logic a bit. Defaults to 'false'.
#   disable_svcacct_auth: disable automagic Service Account auto-authentication when. Primarily used for non-CI runs. Default 'false'.
#   tgz_file: if upload is not latest, specify the relative path to tarball to upload.
function gcs_upload_asset() {
  local $*

  disable_svcacct_auth="${disable_svcacct_auth:-false}"
  service_account_id="${service_account_id:-}"
  service_account_keyfile="${service_account_keyfile:-/tmp/keyfile.json}"
  project_name="${project_name:-}"

  if [[ -z "${disable_svcacct_auth}" ]]; then
    if [[ -z "${service_account_id}" || -z "${project_name}" ]]; then
      printf 'ERROR: gce_upload_asset():: must specify service_account_id and project_name!' 1>&2
      return 1
    fi
  fi

  version="${version:-''}"
  if [[ -z "${version}" ]]; then
    printf 'ERROR: gce_upload_asset(): must specify version!' 1>&2
    return 1
  fi

  upload_source="${upload_source:-/upload}"
  upload_target="${upload_target:-gs://${project_name}/}"
  is_latest="${is_latest:-false}"

  if [ "false" ==  "${is_latest}" ]; then
    if [[ -z "${tgz_file}" ]]; then
      printf 'ERROR: is_latest requires tgz_file!' 1>&2
      return 1
    fi
  fi

  gzip_settings='html,js,css,xml,txt,map,svg,ttf,woff,woff2'
  cache_settings='Cache-Control:no-cache,must-revalidate'

  if [ "false" == "${disable_svcacct_auth}" ]; then
    runCmd gcloud auth activate-service-account "${service_account_id}" --key-file "${service_account_keyfile}" --project "${project_name}"
  else
    echo "INFO: Automatic Service Account auth has been disabled. Falling back to existing account auth..."
  fi

  if [ "false" == "${is_latest}" ]; then
    runCmd gsutil -m cp "${tgz_file} ${upload_target}"
    runCmd gsutil -m cp -z "${gzip_settings}" -R "${upload_source} ${upload_target}"
  else
    runCmd gsutil -h "$cache_settings" -m cp -z "$gzip_settings" -R "${upload_source} ${upload_target}"
    #sleep 5
    #runCmd gsutil -h "$cache_settings" -m rsync -C -c -r -d "${upload_source} ${upload_target}/${version}"
  fi
}
