'use strict';

var history = require('history');
var pathToRegexp = require('path-to-regexp');

function getPath(url) {
    return parse(url).path;
}

function getOrigin() {
    return window.location.origin;
}

function parse(url) {
    let path = url.replace(getOrigin(), '');

    return { path };
}

function hasBasename(path, prefix) {
    return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
}

function addBasename(path, prefix) {
    return hasBasename(path, prefix) ? path : (prefix + path);
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

function Router({
    defaultTransition = DefaultTransition(),
    basename = '',
    scrollRestoration = 'auto',
    transitionParams = {},
} = {}) {
    const matches = [];
    const transitions = [];
    const views = new Map();

    let history$1 = history.createBrowserHistory();
    let prevView = null;
    let nextLocation = null;
    let prevPathname = null;
    let ignoreClass = null;

    window.history.scrollRestoration = scrollRestoration;

    /*
    * Register URL pattern
    * @param {string|array} urls
    * @param {function} fn
    */
    function match(urls, fn) {
        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        urls = urls.map(url => addBasename(url, basename));

        matches.push({ urls, fn });
    }

    /*
    * Register transition from one or multiple URLs to other(s)
    * @param {string|array} fromURLs - 
    * @param {string|array} toURLs - 
    * @param {function} fn - 
    * @param {boolean} backAndForth -
    */
    function transition(fromURLs, toURLs, fn, backAndForth = true) {
        fromURLs = !Array.isArray(fromURLs) ? [fromURLs] : fromURLs;
        toURLs = !Array.isArray(toURLs) ? [toURLs] : toURLs;

        transitions.push({ fromURLs, toURLs, fn, backAndForth });
    }

    /*
    * Register view for one or multiple URLs
    * @param {string|array} urls -
    * @param {function} fn -
    */
    function view(urls, fn) {
        const view = fn();

        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        for (let i = 0; i < urls.length; i++) {
            let url = addBasename(urls[i], basename);
            views.set(url, view);
        }
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

                            await transition.play(prevView, nextView, transitionParams);

                            prevView = nextView;
                        } else {
                            await defaultTransition.play(prevView, nextView, transitionParams);
                            prevView = nextView;
                        }
                    }
                } else {
                    await defaultTransition.play(prevView, nextView, transitionParams);
                    prevView = nextView;
                }
            } else {
                console.error('Router :: View not found', views);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /* 
    * Start listening to URL changes
    * @param {object} options -
    * @param {boolean} options.clickEvents - 
    * @param {string} options.clickIgnoreClass -
    */
    function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
        ignoreClass = clickIgnoreClass;
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
        goBack: history$1.goBack,
        goForward: history$1.goForward,
        nextLocation: () => nextLocation,
    }
}

module.exports = Router;
