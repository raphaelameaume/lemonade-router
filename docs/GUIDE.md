# Guide

- [Register a view](#register-a-view)
- [Register a transition](#register-a-transition)
- [Handle URL parameters](#handle-URL-paramaters)
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

## Handle URL parameters
```js
/* URL parameters */
router.match('/news/:slug', async ({ url, params }) => {
    let News = await import('./News.js');

    router.view(url, () => News(params.slug));
}) 
```

## Code Splitting
```js
router.match('/about', async ({ url }) => {
    let About = await import('./About.js'); // dynamic import

    router.view(url, () => About());
})
```



