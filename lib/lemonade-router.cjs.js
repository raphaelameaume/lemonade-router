'use strict';

var history = require('history');
var pathToRegexp = require('path-to-regexp');

// import { LOAD_VIEW, APPEND_VIEW, REMOVE_VIEW } from "./events.js";

const getPath = (url) => {
    return parse(url).path;
};

const getOrigin = () => window.location.origin;

const parse = (url) => {
    let path = url.replace(getOrigin(), '');

    return { path };
};

const hasBasename = (path, prefix) => {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
};

const addBasename = (path, prefix) => {
    return hasBasename(path, prefix) ? path : (prefix + path);
};

function DefaultTransition() {
    function play(prevView, nextView) {
        if (prevView) {
            prevView.leave(nextView);
        }

        nextView.enter(prevView);
    }

    return {
        play,
    }
}

function retrieveHref(element) {
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

function preventClick(event, element) {
    const href = retrieveHref(element);
    const withKey = event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const blankTarget = element.target && element.target === '_blank';
    const differentDomain = window.location.protocol !== element.protocol || window.location.hostname !== element.hostname;
    const isDownload = element.getAttribute('download') === 'string';
    const isMailto = href && href.includes('mailto:');

    const shouldPrevent = !withKey && !blankTarget && !differentDomain && !isDownload && !isMailto;

    return shouldPrevent;
}

function Router({
    defaultTransition = DefaultTransition(),
    basename = '',
    scrollRestoration = 'manual',
    ignoreClass = 'no-router'
} = {}) {
    const matches = [];
    const transitions = [];
    const views = new Map();

    let history$1 = history.createBrowserHistory();
    let prevView = null;
    let nextLocation = null;
    let prevPathname = null;

    window.history.scrollRestoration = scrollRestoration;

    function match(urls, fn) {
        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        urls = urls.map(url => addBasename(url, basename));

        matches.push({ urls, fn });
    }

    function transition(fromURLs, toURLs, fn, backAndForth = true) {
        fromURLs = !Array.isArray(fromURLs) ? [fromURLs] : fromURLs;
        toURLs = !Array.isArray(toURLs) ? [toURLs] : toURLs;

        transitions.push({ fromURLs, toURLs, fn, backAndForth });
    }

    function view(urls, fn) {
        const view = fn();

        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        urls.forEach(url => {
            const u = addBasename(url, basename);

            views.set(u, view);
        });
    }

    function goTo(href) {
        let path = getPath(href);

        if (path === window.location.pathname) return;

        history$1.push(addBasename(path, basename));
    }

    async function apply(location, prevPathname) {
        try {
            const pathname = addBasename(location.pathname, basename);

            let nextView;

            if (views.has(pathname)) {
                nextView = views.get(pathname);
            } else {
                for (let i = 0; i < matches.length; i++) {
                    const { urls, fn } = matches[i];

                    for (let j = 0; j < urls.length; j++) {
                        const keys = [];
                        const regex = urls[j] === '*' ? /^\/.*(?:\/)?$/i : pathToRegexp.pathToRegexp(urls[j], keys);
                        const match = regex.exec(pathname);

                        if (match && match.length > 0) {
                            const [url, ...values] = match;
                            const params = keys.reduce((acc, key, index) => {
                                acc[key.name] = values[index];
                                return acc;
                            }, {});

                            // remove urls with params
                            const all = [...urls, pathname].filter(u => !u.includes(':'));

                            await fn({ urls: all, url: pathname, params });

                            if (views.has(pathname)) {
                                nextView = views.get(pathname);
                            }

                            break;
                        }
                    }

                    if (nextView) break;
                }
            }

            if (nextView) {
                nextLocation = pathname;

                if (transitions.length > 0) {
                    for (let i = 0; i < transitions.length; i++) {
                        const { fromURLs, toURLs, backAndForth, fn } = transitions[i];

                        const matchFrom = fromURLs.includes('*') || fromURLs.includes(prevPathname);
                        const reverseMatchFrom = backAndForth && fromURLs.includes(pathname);
                        const matchTo = toURLs.includes('*') || toURLs.includes(pathname);
                        const reverseMatchTo = backAndForth && toURLs.includes(prevPathname);

                        if ((matchFrom && matchTo) || (reverseMatchFrom && reverseMatchTo)) {
                            const transition = await fn();

                            await transition.play(prevView, nextView);

                            prevView = nextView;
                        } else {
                            await defaultTransition.play(prevView, nextView);
                            prevView = nextView;
                        }
                    }
                } else {
                    await defaultTransition.play(prevView, nextView);
                    prevView = nextView;
                }
            } else {
                console.error('Router :: View not found', views);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function listen({ clickEvents = false } = {}) {
        prevPathname = getPath(window.location.href);

        history$1.listen((location) => {
            prevPathname = getPath(window.location.href);

            apply(location, prevPathname);
        });

        apply(window.location, prevPathname);

        if (clickEvents) {
            document.addEventListener('click', (event) => {
                let target = event.target;

                while (target && !retrieveHref(target)) {
                    target = target.parentNode;
                }

                if (target && preventClick(event, target) && !target.classList.contains(ignoreClass)) {
                    event.preventDefault();
                    event.stopPropagation();

                    const href = retrieveHref(target);
                    const url = getPath(href);
                    router.goTo(url);
                }
            });
        }
    }

    return {
        match,
        transition,
        view,
        listen,
        goTo,
        nextLocation: () => nextLocation,
    }
}

module.exports = Router;
