function enterView(view) {
    view.style.display = 'flex';
}

function leaveView(view) {
    view.style.display = 'none';
}

function Home() {
    let view;

    function enter() {
        console.log('Home :: enter');
        view = document.querySelector('.view--home');
        enterView(view);
    }

    function leave() {
        console.log('Home :: leave');
        leaveView(view);
    }

    return { enter, leave };
}

function About() {
    let view;

    function enter() {
        console.log('About :: enter');
        view = document.querySelector('.view--about');
        enterView(view);
    }

    function leave() {
        console.log('About :: leave');
        leaveView(view);
    }

    return { enter, leave };
}

function Contact() {
    let view;

    function enter() {
        console.log('Contact :: enter');
        view = document.querySelector('.view--contact');
        enterView(view);
    }

    function leave() {
        console.log('Contact :: leave');
        leaveView(view);
    }

    return { enter, leave };
}

let router = Lemonade.RouterDOM({
    basename: '/examples/dom',
});

router.view('', Home);

router.view('/contact/', Contact);

router.match('/about', async () => {
    router.view('/about', About);
});

router.listen({
    clickEvents: true,
});