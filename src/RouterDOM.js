import { getPath, loadView, appendView, removeView } from "./helpers.js";
import { Router } from "./Router.js";
import { TransitionDOM } from "./TransitionDOM.js";

export function RouterDOM({
    wrapperClass = '.wrapper',
    containerClass = '.container',
    ignoreClass = 'no-router',
    cacheEnabled = true,
    defaultTransition = TransitionDOM(),
    basename = ''
} = {}) {
    let router = Router({ defaultTransition, basename, ignoreClass });
    let $wrapper = document.querySelector(wrapperClass);
    let $prevContainer = $wrapper.querySelector(containerClass);
    let $nextContainer = null;

    let cache = new Map();

    function listen({ clickEvents = false } = {}) {
        router.listen({ clickEvents });

        if (cacheEnabled) {
            cache.set(getPath(window.location.href), document.documentElement.innerHTML);
        }
    }

    async function load({ resolve, reject }) {
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

        resolve($nextContainer);
    }

    function appendToWrapper()
        $wrapper.appendChild($nextContainer);
    }

    function removeFromWrapper()
        $prevContainer.parentNode.removeChild($prevContainer);
    }

    on(LOAD_VIEW, load);
    on(APPEND_VIEW, appendToWrapper);
    on(REMOVE_VIEW, removeFromWrapper);

    return {
        listen,
        match: router.match,
        view: router.view,
        transition: router.transition,
        goTo: router.goTo,
    }
}

RouterDOM.fetch = async () => {
    let html = await Thread.fetch(nextLocation, {
        format: 'text',
    });

    return html;
};

RouterDOM.loadView = loadView;
RouterDOM.appendView = appendView;
RouterDOM.removeView = removeView;