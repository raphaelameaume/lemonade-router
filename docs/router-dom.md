#### <sup>[lemonade-router](../README.md) → [Documentation](./README.md) → RouterDOM</sup>

---

## RouterDOM

### router = RouterDOM([options])
- `options.wrapperQuery`: A function used to query the main wrapper. Default to `() => querySelector('.lemonade-wrapper`)`.
- `options.containerQuery`: A function used to query the containers. Default to `() => querySelector('.lemonade-container`)`.
- `options.cacheEnabled`: A boolean defining if fetched pages should be cached. Default to `true`.
Check [`Router` documentation](./router.md) for other available options.

### router.listen([options])
Check [`Router` documentation](./router.md) for available options.

### router.view(url, fn)
See [`Router` documentation](./router.md#routerviewurl-fn))

### router.transition(from, to, fn, backAndForth)
See [`Router` documentation](./router.md#routertransitionfrom-to-fn-backandforth)

### router.match(pattern, fn)
See [`Router` documentation](./router.md#routermatchpattern-fn)