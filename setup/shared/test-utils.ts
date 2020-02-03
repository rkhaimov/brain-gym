export const genString = (() => {
    let call = 0;

    return () => {
        call = call + 1;

        return '='.repeat(call);
    };
})();
