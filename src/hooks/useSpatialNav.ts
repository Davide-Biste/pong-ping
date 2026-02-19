import { useCallback, useRef, useEffect } from 'react';
import { useAction } from './useAction';

type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Spatial navigation via arrow keys.
 * Elements opt-in with: data-nav="true" tabIndex={0}
 * Scoped with: data-nav-group="groupId"
 * Elements without data-nav-group are always included (e.g. Navbar).
 */
export function useSpatialNav(groupId: string = 'default') {
    const containerRef = useRef<HTMLElement | null>(null);

    const getNavigableElements = useCallback((): HTMLElement[] => {
        const root = containerRef.current || document;
        const selector = `[data-nav="true"][data-nav-group="${groupId}"],[data-nav="true"]:not([data-nav-group])`;
        return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => {
            return el.offsetParent !== null && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';
        });
    }, [groupId]);

    const findNearest = useCallback((current: HTMLElement, direction: Direction): HTMLElement | null => {
        const elements = getNavigableElements();
        if (elements.length === 0) return null;

        const rect = current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let bestEl: HTMLElement | null = null;
        let bestDist = Infinity;

        for (const el of elements) {
            if (el === current) continue;
            const r = el.getBoundingClientRect();
            const ex = r.left + r.width / 2;
            const ey = r.top + r.height / 2;

            const dx = ex - cx;
            const dy = ey - cy;

            let isValid = false;
            switch (direction) {
                case 'up':    isValid = dy < -10; break;
                case 'down':  isValid = dy > 10;  break;
                case 'left':  isValid = dx < -10; break;
                case 'right': isValid = dx > 10;  break;
            }
            if (!isValid) continue;

            // Weighted distance: penalize offset on perpendicular axis
            const dist = (direction === 'up' || direction === 'down')
                ? Math.abs(dy) + Math.abs(dx) * 2
                : Math.abs(dx) + Math.abs(dy) * 2;

            if (dist < bestDist) {
                bestDist = dist;
                bestEl = el;
            }
        }

        return bestEl;
    }, [getNavigableElements]);

    // Helper function to focus with visible indicator
    const focusWithVisible = useCallback((element: HTMLElement) => {
        try {
            // Try with focusVisible option (experimental but supported in modern browsers)
            element.focus({
                preventScroll: false,
                focusVisible: true
            } as FocusOptions & { focusVisible?: boolean });
        } catch {
            // Fallback: just focus normally
            element.focus({ preventScroll: false });
        }
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, []);

    const navigate = useCallback((direction: Direction) => {
        const current = document.activeElement as HTMLElement;
        const elements = getNavigableElements();

        // If nothing focused or focused element is not navigable, focus first element
        if (!current || !elements.includes(current)) {
            if (elements.length > 0) {
                focusWithVisible(elements[0]);
            }
            return;
        }

        const target = findNearest(current, direction);
        if (target) {
            focusWithVisible(target);
        }
    }, [getNavigableElements, findNearest, focusWithVisible]);

    // Auto-focus first element on mount
    useEffect(() => {
        const elements = getNavigableElements();
        if (elements.length > 0 && !document.activeElement?.hasAttribute('data-nav')) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                const firstElement = getNavigableElements()[0];
                if (firstElement) {
                    focusWithVisible(firstElement);
                }
            }, 100);
        }
    }, [groupId, getNavigableElements, focusWithVisible]);

    useAction('nav_up',    () => navigate('up'),    [navigate]);
    useAction('nav_down',  () => navigate('down'),  [navigate]);
    useAction('nav_left',  () => navigate('left'),  [navigate]);
    useAction('nav_right', () => navigate('right'), [navigate]);

    return { containerRef };
}
