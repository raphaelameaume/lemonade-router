export function getPath(url) {
    return parse(url).path;
}

export function getHref() {
    return window.location.href;
}

export function getOrigin() {
    return window.location.origin;
}

export function parse(url) {
    let path = url.replace(getOrigin(), '');

    return { path };
}

export function hasBasename(path, prefix) {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}

export function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

export function addBasename(path, prefix) {
    return hasBasename(path, prefix) ? path : (prefix + path);
}