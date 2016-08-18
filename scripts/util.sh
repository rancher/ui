
# Execute something and exit if it fails
function runCmd() {
  $@
  if [[ $? -ne 0 ]]; then
    echo "Command: $@ failed"
    exit 2
  fi
}

function gce_upload_asset() {
    
    # service account auth requires a little bit of setup
    GS_SERVICE_ACCOUNT_KEYFILE=$(mktemp -dt "$0.XXXXXXXXXX")
    echo ${GS_SERVICE_ACCOUNT_KEY} > ${GS_SERVICE_ACCOUNT_KEYFILE}
    runCmd gcloud auth activate-service-account ${GS_SERVICE_ACCOUNT_ID} --key-file ${GS_SERVICE_ACCOUNT_KEYFILE} \
	   --project ${GS_PROJECT_NAME}
    rm -f $GS_SERVICE_ACCOUNT_KEYFILE
}
