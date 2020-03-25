import { createBrowserHistory, parsePath } from "history";
import { pathToRegexp } from "path-to-regexp";
import { getPath, retrieveHref, preventClick, stripBasename, stripTrailingSlash } from "./helpers.js";
import { DefaultTransition } from "./DefaultTransition.js";

function Router({
    defaultTransition = DefaultTransition(),
    basename = '',
    scrollRestoration = 'auto',
    transitionParams = {},
} = {}) {
    const matches = [];
    const transitions = [];
    const views = new Map();

    let history = createBrowserHistory({ basename });
    let prevView = null;
    let prevPathname = null;

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
            let url = stripTrailingSlash(urls[i]);
            views.set(url, view);
        }
    }

    function goTo(href) {
        const { pathname, search, hash } = parsePath(getPath(window.location.href));

        const nextPath = getPath(href);
        const { pathname: nextPathname, search: nextSearch, hash: nextHash } = parsePath(nextPath);

        if (pathname === nextPathname && search === nextSearch && hash === nextHash) return;

        history.push(stripBasename(nextPath, basename));
    }

    async function apply(location, prevPathname) {
        try {
            const pathname = stripTrailingSlash(location.pathname);

            let nextView;

            if (views.has(pathname)) {
                nextView = views.get(pathname);
            } else {
                for (let i = 0; i < matches.length; i++) {
                    const { urls, fn } = matches[i];

                    for (let j = 0; j < urls.length; j++) {
                        const keys = [];
                        const regex = urls[j] === '*' ? /^\/.*(?:\/)?$/i : pathToRegexp(urls[j], keys);
                        const match = pathname !== "" ? regex.exec(pathname) : regex.exec('/');

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
                router.nextLocation = history.createHref(location);

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
        router.clickIgnoreClass = clickIgnoreClass;

        prevPathname = stripBasename(parsePath(getPath(window.location.href)).pathname, basename);

        history.listen((location) => {
            apply(location, prevPathname);

            prevPathname = stripBasename(location.pathname, basename);
        });

        apply(history.location, null);

        if (clickEvents) {
            document.addEventListener('click', (event) => {
                let target = event.target;

                while (target && !retrieveHref(target)) {
                    target = target.parentNode;
                }

                if (target && preventClick(event, target) && !target.classList.contains(router.clickIgnoreClass)) {
                    event.preventDefault();
                    event.stopPropagation();

                    const href = retrieveHref(target);
                    const url = getPath(href);
                    router.goTo(url);
                }
            });
        }
    }

    const router = {
        nextLocation: null,
        clickIgnoreClass: 'no-router',
        match,
        transition,
        view,
        listen,
        goTo,
        history,
        getPath: (url) => stripBasename(getPath(url), basename),
    };

    return router;
}

export { Router };