# lemonade-router

`lemonade-router` is a non-opiniated routing library to create websites and interactive experiences. It is heavily inspired by [Barba.js](https://github.com/barbajs/barba) and [React Router](https://github.com/ReactTraining/react-router).

- [Documentation](https://github.com/raphaelameaume/lemonade-router/tree/master/docs/README.md)
- [Examples](https://github.com/raphaelameaume/lemonade-router/tree/master/demo)

## Installation

`npm install lemonade-router`

### Usage

```js
import Router from "lemonade-router"

let router = Router();

router.view('/', Home);
router.view(`news`, News);
router.match(`/news:id`, async ({ params }) => {
    let News = await import('./News.js');

    router.view(`/news/${params.id}`, () => News(params.id));
});

router.listen();

```

## Credits
- [Barba.js](https://github.com/barbajs/barba)
- [React Router](https://github.com/ReactTraining/react-router)

## License

MIT License, see [LICENSE.md](https://github.com/raphaelameaume/lemonade-router/tree/master/LICENSE.md) for details