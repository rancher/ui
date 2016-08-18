
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
#   service_accout_key - key for service account in JSON format
#   project_name - the Google Cloud project name which owns the Storage bucket
#   upload_source - the directory or file to upload
#   version - the upload version
#
# optional parameters:
#   latest - we are uploading 'latest' which requires a some special upload magic
function gce_upload_asset() {
    local $*

    # these are absolutely required
    if [[ -z "$service_account_id" || -z $"service_account_key" || -z "$project_name" || -z "upload_source" || -z "$version" ]]; then
	echo "gce_upload_asset(): must specify:\n" \
	     "  - service_account_id\n" \
	     "  - service_account_key\n" \
	     "  - project_name\n" \
	     "  - upload_source\n" \
	     "  - version\n" \
	     >&2
    fi

    $gzip_settings='html,js,css,xml,txt,map,svg,ttf,woff,woff2'
    $cache_settings='Cache-Control:no-cache,must-revalidate'

    # gsutil auth needs a tmpfile fed in with key/token
    $service_account_keyfile=$(mktemp -dt "$0.XXXXXXXXXX")
    echo "${service_account_key}" > $service_account_keyfile
    runCmd gcloud auth activate-service-account $service_account_id --key-file $service_account_keyfile \
	   --project $project_name
    rm -f $service_account_keyfile

    if [[ -n "$latest" ]]; then
	runCmd gsutil -h "$cache_settings" -m cp -z "$gzip_settings" -R "${upload_source}" "${upload_dest}/_upload"
	runCmd gsutil -h "$cache_settings" rsync -c -r -d "${upload_dest}/_upload" "${upload_dest}/${version}"
	runCmd gsutil rm -a -f -R "${upload_dest}/_upload"
    else
	echo "FIXME!" ; exit -1
    fi

    
}
