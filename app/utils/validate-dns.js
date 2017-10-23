export function validateHostname(hostname){
    //hostname can not start with a dot
    if (hostname.slice(0,1) ==='.'){
        return false;
    }
    //hostname can not be empty string
    if (hostname.length === 0){
        return false;
    }
    //total length of the hostname can be at most 253 characters (255 minus one for null-termination, and one for the trailing dot if not already present)
    if (hostname.length > 253) {
        return false;
    }
    //split the hostname with the dot and validate the element as label
    let labels = hostname.split(/\./);
    for(var i = 0; i < labels.length; i++){
        let label = labels[i];
        //hostname can end with a dot (this makes it an explicitly fully qualified domain name, but is not always desirable)
        //it meas that the last element of the labels can be empty string.
        if (i === labels.length-1 && label === ""){
            continue;
        }
        if (!validateLabel(label)){
            return false;
        }
    }
    return true;
}

export function validateLabel(label){
    let test = label.toLowerCase();
    //label must consist of the characters a-z (case-insensitive), 0-9, and hyphen
    if (!test.match(/^[a-z0-9-]+$/i)){
        return false;
    }
    //label cannot start with or end with a hyphen
    if (test.slice(0,1) === '-' || test.slice(-1) === '-') {
        return false;
    }
    //label cannot contain two consecutive hyphens
    if (test.includes('--')){
        return false;
    }
    //label must be 1-63 characters
    if (test.length < 1 || test.length > 63){
        return false;
    }
    return true;
}

export default {
    validateHostname:validateHostname,
    validateLabel:validateLabel,
};