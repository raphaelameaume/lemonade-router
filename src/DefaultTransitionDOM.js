export function DefaultTransitionDOM() {
    async function play(prevView, nextView, { loadView, appendView, removeView }) {
        if (prevView) {
            await prevView.leave(nextView);
            await loadView(); // must be called before appendView
            appendView();
            removeView();
        }

        await nextView.enter(prevView);
    }

    return {
        play,
    };
};