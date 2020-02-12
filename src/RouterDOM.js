import Router from "./Router.js";
import { getPath } from "./helpers.js";
import { DefaultTransitionDOM } from "./DefaultTransitionDOM.js";

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

export default RouterDOM;

// RouterDOM.fetch = async () => {
//     let html = await Thread.fetch(nextLocation, {
//         format: 'text',
//     });

//     return html;
// };