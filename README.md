# lemonade-router

`lemonade-router` is a minimal non-opiniated routing library to create websites and interactive experiences with custom transitions. It is heavily inspired by [Barba.js](https://github.com/barbajs/barba) and [React Router](https://github.com/ReactTraining/react-router) and uses [history](https://github.com/barbajs/barba) under the hood.

- [Documentation](https://github.com/raphaelameaume/lemonade-router/tree/master/docs/README.md)
- [Examples](https://github.com/raphaelameaume/lemonade-router/tree/master/demo)

## Installation

`npm install lemonade-router`

### Usage

```js
import Router from "lemonade-router"

let router = Router();

// views
router.view('/', () => Home());
router.view('/news', () => News());

// matches
router.match('/news/:id', async ({ params }) => {
    let News = await import('./News.js');

    router.view(`/news/${params.id}`, () => News(params.id));
});

router.match('*', async () => {
    let NotFound = await import('./NotFound.js');

    router.view('*', () => NotFound());
});

// transitions
router.transition('/', '/news', () => FromHomeToNews());

router.listen();

```

## Motivation
This routing library attempts to solve different problems I had the past few years working on websites and interactives experiences:
- Change URL without fetching an existing page, useful for WebGL experiences or when all the DOM is already here
- Create custom transitions where I have total control over DOM changes
- Define complex loading sequences 
- Allow multiple pages to work on different URLs (multilingual websites)
- Split code to avoid loading big bundles

## Credits
- [Barba.js](https://github.com/barbajs/barba)
- [React Router](https://github.com/ReactTraining/react-router)
- [Canvas-sketch](https://github.com/mattdesl/canvas-sketch)

## License

MIT License, see [LICENSE](https://github.com/raphaelameaume/lemonade-router/tree/master/LICENSE) for details