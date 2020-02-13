export function getPath(url) {
    return parse(url).path;
}

export function parse(url) {
    let path = url.replace(window.location.origin, '');

    return { path };
}

export function hasBasename(path, prefix) {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}

export function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

/*
* https://github.com/barbajs/barba/blob/1.x/src/Pjax/Pjax.js#L179
*/ 
export function retrieveHref(element) {
    if (element) {
        const xlink = element.getAttribute && element.getAttribute('xlink:href');

        if (typeof xlink === 'string') {
            return xlink;
        }

        if (element.href) {
            return element.href;
        }
    }

    return false;
}

/*
* https://github.com/barbajs/barba/blob/1.x/src/Pjax/Pjax.js#L239
*/
export function preventClick(event, element) {
    const href = retrieveHref(element);
    const withKey = event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const blankTarget = element.target && element.target === '_blank';
    const differentDomain = window.location.protocol !== element.protocol || window.location.hostname !== element.hostname;
    const isDownload = element.getAttribute('download') === 'string';
    const isMailto = href && href.includes('mailto:');
    const shouldPrevent = !withKey && !blankTarget && !differentDomain && !isDownload && !isMailto;

    return shouldPrevent;
}