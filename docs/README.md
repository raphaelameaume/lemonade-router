# Documentation

## Router

### router = Router([options])
- `options.defaultTransition`: An object or a class implementing a `play(prevView, nextView)` method. Default to [DefaultTransition]
- `options.scrollRestoration`: Option to change `history.scrollRestoration`. Check the [documentation](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration) to see available options. Default to auto.
- `options.basename`: Set a prefix to URL before navigating to an other url. Useful for subdomain with relative links.

### router.listen([options])
Start listening to POPSTATE events
- `options.clickEvents`: If set to `true`, will prevent links across the pages to trigger a page refresh
- `options.clickIgnoreClass`: Disable previous behaviour for links with specified className

### router.view(url, fn)
Register a view to the Router. If the current URL matches the `url` param, it will trigger `fn`.
- `url`: A string or an array of string reflecting exact URLs
- `fn`: Must return an instance of a view

Example

### router.transition(from, to, fn, backAndForth)
Register a transition to the router defined by source and destination URLs
- `from`: an string or an array of URLs 
- `to`: an string or an array of URLs 
- `fn`: a function that returns a class or an object implementing a `play(prevView, nextView)` method (can be async) like in [DefaultTransition]
- `backAndForth`: a boolean defining if the transition should be played in reverse too. Default to `true`.

Example


### router.match(pattern, fn)
Register a pattern and execute `fn` on match. Useful for URL with parameters like `/news/:slug` or code splitting.
The router will resolve views after executing matching callbacks so you can add view in `fn`.
- `options.pattern`: A string or an array of string of patterns. This uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) under the hood.
- `fn`: A sync or async function to be executed on match.

[URL parameters example](https://github.com/raphaelameaume/lemonade-router/tree/master/docs/GUIDE.md#handle-URL-parameters)
[Code splitting example](https://github.com/raphaelameaume/lemonade-router/tree/master/docs/GUIDE.md#code-splitting)