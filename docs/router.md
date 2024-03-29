#### <sup>[lemonade-router](../README.md) → [Documentation](./README.md) → Router</sup>

---

## Router

### router = Router([options])
- `options.defaultTransition`: An object or a class implementing a `play(prevView, nextView, transitionParams)` method. Default to [DefaultTransition]
- `options.scrollRestoration`: A string to change `history.scrollRestoration`. Check the [documentation](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration) to see available options. Default to `'auto'`.
- `options.basename`: Set a prefix to URL before navigating to an other url. Useful for subdomain with relative links.
- `options.transitionParams`: An object that will be passed to `transition.play`

### router.listen([options])
Search for current view from current URL and start listening to URL changes.
- `options.clickEvents`: If set to `true`, will prevent links across the pages to trigger a page refresh
- `options.clickIgnoreClass`: Disable previous behaviour for links with specified className

### router.view(url, fn)
Register a view to the Router. If the current URL matches the `url` param, it will trigger `fn`.
- `url`: A string or an array of string reflecting exact URLs
- `fn`: Must return an instance of a view

Guide:
- [Register a view](./GUIDE.md#register-a-view)

### router.transition(from, to, fn, backAndForth)
Register a transition to the router defined by source and destination URLs
- `from`: A string or an array of URLs 
- `to`: A string or an array of URLs 
- `fn`: A function that returns a class or an object implementing a `play(prevView, nextView)` method (can be async) like in [DefaultTransition]
- `backAndForth`: A boolean defining if the transition should be played in reverse too. Default to `true`.

Guide:
- [Register a transition](./GUIDE.md#register-a-transition)


### router.match(pattern, fn)
Register a pattern and execute `fn` on match. Useful for URL with parameters like `/news/:slug` or code splitting.
The router will resolve views after executing matching callbacks so you can add view in `fn`.
- `options.pattern`: A string or an array of string of patterns. This uses [path-to-regexp](https://www.npmjs.com/package/path-to-regexp) under the hood.
- `fn`: A sync or async function to be executed on match.

Guides:
- [Handle URL parameters](./GUIDE.md#handle-URL-parameters)
- [Code splitting](./GUIDE.md#code-splitting)