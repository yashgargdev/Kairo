'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function NavigationProgress() {
    return (
        <ProgressBar
            height="2px"
            color="#d4af37"
            options={{ showSpinner: false, easing: 'ease', speed: 300 }}
            shallowRouting
        />
    );
}
