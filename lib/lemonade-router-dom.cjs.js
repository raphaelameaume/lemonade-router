'use strict';

var history = require('history');
var pathToRegexp = require('path-to-regexp');

function getPath(url) {
    return parse(url).path;
}

function parse(url) {
    let path = url.replace(window.location.origin, '');

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
        prev: history$1.goBack,
        next: history$1.goForward,
        nextLocation: () => nextLocation,
    }
}

function DefaultTransitionDOM() {
    async function play(prevView, nextView, { loadView, appendView, removeView }) {
        if (prevView) {
            await prevView.leave(nextView);
            await loadView(); // must be called before appendView
            appendView();
            removeView();
        }

        await nextView.enter(prevView);
    }

    return {
        play,
    };
}

function RouterDOM({
    wrapperClass = '.lemonade-wrapper',
    containerClass = '.lemonade-container',
    ignoreClass = 'no-router',
    cacheEnabled = true,
    defaultTransition = DefaultTransitionDOM(),
    transitionParams = {},
    basename = ''
} = {}) {
    let router = Router({
        defaultTransition,
        basename,
        ignoreClass,
        transitionParams: {
            ...transitionParams,
            loadView,
            appendView,
            removeView,
        }
    });
    let cache = new Map();
    let $wrapper, $prevContainer, $nextContainer;

    function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
        $wrapper = document.querySelector(wrapperClass);
        $prevContainer = $wrapper.querySelector(containerClass);

        router.listen({ clickEvents, clickIgnoreClass });

        if (cacheEnabled) {
            cache.set(getPath(window.location.href), document.documentElement.innerHTML);
        }
    }

    async function loadView() {
        let html;
        let nextLocation = router.nextLocation();

        if (cacheEnabled && cache.get(nextLocation)) {
            html = cache.get(nextLocation);
        } else {
            const response = await RouterDOM.fetch(nextLocation);
            html = response.result;

            if (cacheEnabled) {
                cache.set(nextLocation, html);
            }
        }

        const temp = document.createElement('div');
        temp.innerHTML = html;

        const title = temp.querySelector('title');

        if (title) {
            document.title = title.textContent;
        }

        $prevContainer = $wrapper.querySelector(containerClass);
        $nextContainer = temp.querySelector(containerClass);

        return $nextContainer;
    }

    function appendView() {
        $wrapper.appendChild($nextContainer);
    }

    function removeView() {
        $prevContainer.parentNode.removeChild($prevContainer);
    }

    return {
        listen: listen,
        match: router.match,
        view: router.view,
        transition: router.transition,
        goTo: router.goTo,
    }
}

RouterDOM.fetch = async (url) => {
    let response = await fetch(url);
    let html = await response.text();

    return html;
};

// RouterDOM.fetch = async () => {
//     let html = await Thread.fetch(nextLocation, {
//         format: 'text',
//     });

//     return html;
// };

module.exports = RouterDOM;
