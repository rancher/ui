# Execute something and exit if it fails
function runCmd() {
  $@
  if [[ $? -ne 0 ]]; then
  echo "Command: $@ failed" >&2
  exit 2
  fi
}
