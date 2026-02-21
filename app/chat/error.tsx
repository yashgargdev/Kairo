'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Something went wrong!</h2>
            <p className="text-sm text-foreground/50 mb-6 max-w-sm">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
                Try again
            </button>
        </div>
    );
}
