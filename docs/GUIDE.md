#### <sup>[lemonade-router](../README.md) → [Documentation](./README.md) → Guide</sup>

---

- [Register a view](#register-a-view)
- [Register a transition](#register-a-transition)
- [Handle URL parameters](#handle-url-parameters)
- [Code splitting](#code-splitting)

## Register a view
```js
/* with functions */
function Home() {
    function enter() {
        console.log('Home :: enter');
    }

    function leave() {
        console.log('Home :: enter');
    }

    return { enter, leave };
}

router.view('/', () => Home());

/* with classes */
class Home  {
    constructor() {}
    enter() {}
    leave() {}
}

router.view('/' , () => return new Home());
```

## Register a transition
```js
/* with functions*/
function CustomTransition() {
    return {
        play: (prevView, nextView) {
            // do sync or async stuff
            if (prevView) { // prevView is null on start
                prevView.leave(nextView)
            }

            nextView.enter(prevView);
        }
    }
}

router.transition('/about', '/news', () => CustomTransition(), false);

/* with classes */
class CustomTransition() {
    constructor() {}
    play(prevView, nextView) {}
}

router.transition('/news', '/', () => new CustomTransition());
```

## Code Splitting
```js
router.match('/about', async ({ url }) => {
    let About = await import('./About.js'); // dynamic import

    router.view(url, () => About());
})
```

## Handle URL parameters
`router.match` supports async functions and return URL parameters as an object
```js
router.match('/news/:slug', async ({ url, params }) => {
    let News = await import('./News.js');

    router.view(url, () => News(params.slug));
}) 
```

## [RouterDOM] Use a custom fetch function
By default, RouterDOM fetch the next page using the `fetch` API. In some cases you'll want to provide your own fetch function. To do so, you can overwrite the fetch function on RouterDOM. Be careful as Router.fetch expect a function returning a `Promise` in order to work.

```js
import { RouterDOM } from "lemonade-router";

RouterDOM.fetch = (url) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
            resolve(xhr.responseText);
        });
        xhr.open("GET", url);
        xhr.send();
    });
};
```