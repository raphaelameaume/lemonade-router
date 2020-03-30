import { Router } from "./Router.js";
import { DefaultTransitionDOM } from "./DefaultTransitionDOM.js";

function RouterDOM({
    wrapperQuery = () => document.querySelector('.lemonade-wrapper'),
    containerQuery = ($wrapper) => $wrapper.querySelector('.lemonade-container'),
    cacheEnabled = true,
    defaultTransition = DefaultTransitionDOM(),
    transitionParams = {},
    basename = ''
} = {}) {
    let router = Router({
        defaultTransition,
        basename,
        transitionParams: {
            ...transitionParams,
            loadView,
            appendView,
            removeView,
            wrapperQuery,
            containerQuery,
        }
    });
    let cache = new Map();
    let $wrapper, $prevContainer, $nextContainer;

    function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
        $wrapper = wrapperQuery();
        $prevContainer = containerQuery($wrapper);

        router.listen({ clickEvents, clickIgnoreClass });

        let path = router.getPath(window.location.href);
        if (cacheEnabled && !cache.has(path)) {
            cache.set(path, document.documentElement.innerHTML);
        }
    }

    async function loadView() {
        let html;
        let { nextLocation } = router;
        let nextPath = router.getPath(nextLocation);

        if (cacheEnabled && routerDOM.cache.get(nextPath)) {
            html = cache.get(nextPath);
        } else {
            html = await RouterDOM.fetch(nextLocation);

            if (cacheEnabled) {
                cache.set(nextPath, html);
            }
        }

        const temp = document.createElement('html');
        temp.innerHTML = html;

        const title = temp.querySelector('title');

        if (title) {
            document.title = title.textContent;
        }

        $prevContainer = containerQuery($wrapper);
        $nextContainer = containerQuery(temp);

        return {
            prevContainer: $prevContainer,
            nextContainer: $nextContainer,
            temp,
        };
    }

    function appendView() {
        $wrapper.appendChild($nextContainer);
    }

    function removeView() {
        $wrapper.removeChild($prevContainer);
    }

    const routerDOM = {
        listen: listen,
        match: router.match,
        view: router.view,
        transition: router.transition,
        goTo: router.goTo,
        getPath: router.getPath,
        cache,
    };

    return routerDOM;
}

RouterDOM.fetch = async (url) => {
    let response = await fetch(url);
    let html = await response.text();

    return html;
};

export { RouterDOM };