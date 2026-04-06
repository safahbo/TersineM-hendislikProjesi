// Hardened Regex Patterns (ReDoS önlemli)
module.exports = {
    url: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
    ip: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    sensitive: /(?:password|passwd|secret|token|api_key|private_key)["'\s:=]+([^\s"']+)/gi,
    potential_key: /\b[A-Za-z0-9+/=]{32,64}\b/g 
};
