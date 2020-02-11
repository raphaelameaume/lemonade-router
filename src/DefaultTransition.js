export function DefaultTransition() {
    function play(prevView, nextView) {
        if (prevView) {
            prevView.leave(nextView);
        }

        nextView.enter(prevView);
    }

    return {
        play,
    }
}