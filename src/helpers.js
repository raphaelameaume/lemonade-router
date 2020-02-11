// import { LOAD_VIEW, APPEND_VIEW, REMOVE_VIEW } from "./events.js";

export function loadView() {
    return emitAsync(LOAD_VIEW);
}

export function appendView() {
    emit(APPEND_VIEW);
}

export function removeView() {
    emit(REMOVE_VIEW);
}

export const getPath = (url) => {
    return parse(url).path;
};

export const getHref = () => window.location.href;

export const getOrigin = () => window.location.origin;

export const parse = (url) => {
    let path = url.replace(getOrigin(), '');

    return { path };
};

export const hasBasename = (path, prefix) => {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
};

export const stripBasename = (path, prefix) => {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
};

export const addBasename = (path, prefix) => {
    return hasBasename(path, prefix) ? path : (prefix + path);
};