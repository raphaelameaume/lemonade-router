# Documentation

## Router

### router = Router([options])
- `options.defaultTransition`: An object or a class implementing a `play` method. Default to [DefaultTransition]
- `options.scrollRestoration`: Option to change `history.scrollRestoration`. Check the [documentation](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration) to see available options. Default to auto.
- `options.basename`: Set a prefix to URL before navigating to an other url. Useful for subdomain with relative links.

### router.listen([options])
Start listening to POPSTATE events
- `options.clickEvents`: If set to `true`, will prevent links across the pages to trigger a page refresh
- `options.clickIgnoreClass`: Disable previous behaviour for links with specified className

### router.view(url, callback)
Register a view to the Router. If the current URL matches the `url` param, it will trigger `callback`.
- `url`: A string or an array of different strings
- `callback`: Must return an instance of view 
Example:
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

### router.transition(from, to, fn, backAndForth)
Register a transition to the router defined by source and destination URLs
- `from`: an string or an array of URLs 
- `to`: an string or an array of URLs 
- `fn`: a function that returns a class/an oject implementing a `play(prevView, nextView)` method (can be async) like in [DefaultTransition]
- `backAndForth`: a boolean defining if the transition should be played in reverse too. Default to `true`.
Example:
```js
/* with functions*/
function CustomTransition() {
    return {
        play: (prevView, nextView) {
            if (prevView) { // prevView is null on start
                prevView.leave(nextView)
            }

            nextView.enter();
        }
    }
}

router.transition('/news', '/about', () => CustomTransition(), false);

/* with classes */
class CustomTransition() {
    constructor() {}
    play(prevView, nextView) {}
}

router.transition('/news', '/about', () => new CustomTransition());
```
As you can see, `lemonade-router` doesn't enforce a particuliar naming or logic!  


### router.match(pattern, callback)


- [Basic](https://github.com/raphaelameaume/lemonade-router/tree/master/docs/Basic.md)