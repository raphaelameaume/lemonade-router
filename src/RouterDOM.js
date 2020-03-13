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
        }
    });
    let cache = new Map();
    let $wrapper, $prevContainer, $nextContainer;

    function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
        $wrapper = wrapperQuery();
        $prevContainer = containerQuery($wrapper);

        router.listen({ clickEvents, clickIgnoreClass });

        if (cacheEnabled && !cache.has(window.location.pathname)) {
            cache.set(window.location.pathname, document.documentElement.innerHTML);
        }
    }

    async function loadView() {
        let html;
        let { nextLocation } = router;

        if (cacheEnabled && cache.get(nextLocation)) {
            html = cache.get(nextLocation);
        } else {
            html = await RouterDOM.fetch(nextLocation);

            if (cacheEnabled) {
                cache.set(nextLocation, html);
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