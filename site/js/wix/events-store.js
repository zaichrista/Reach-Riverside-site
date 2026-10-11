// The events listing as a framework-free store — the logic behind useEvents, usable from React
// (useEvents wraps it with useSyncExternalStore), from a static page or Vue/Svelte (subscribe and
// render), or as the specification for a port. State, actions, subscribe/getState, emit after
// every change.
//
// SSR-friendly: seed with `initialEvents` (+ `initialTotal` from fetchEventsPage) and they render
// at once with no client fetch; a SPA passes nothing and `start()` fetches the first page. Pages
// are Wix's 20; `loadMore()` appends the next. The category pills are the site's MANUAL categories
// (Query Categories on the visitor token, as Wix's listing does); when that read is refused for
// this site's visitor scope the pills fall back to the manual categories on the loaded events.
// Filtering by category is client-side while the whole list is loaded, server-side (a refetch)
// once there are more pages than loaded — so a filter never hides events on unloaded pages.
//
// One store per mounted listing (a page can hold the index and a "next up" rail):
// createEventsStore(), not a singleton.
import { fetchCategories, fetchEventsPage } from "./events.js";
import { DEFAULT_PAGE_SIZE } from "./events-core.js";
export function createEventsStore({ initialEvents, initialTotal, pageSize = DEFAULT_PAGE_SIZE, status } = {}) {
    // `all` is the unfiltered list; `filtered` is the server-filtered list for the active category (null = not in use).
    let all = initialEvents ?? null;
    let allTotal = initialTotal ?? initialEvents?.length ?? 0;
    let filtered = null;
    let filteredTotal = 0;
    let fetchedCategories = null;
    let activeCategoryId = null;
    let loadingMore = false;
    let error = null;
    let started = false;
    let generation = 0; // bumps on every filter change so a late page for an old filter is dropped
    const listeners = new Set();
    let snapshot = null;
    const emit = () => {
        snapshot = null;
        for (const fn of listeners)
            fn();
    };
    const message = (e) => (e instanceof Error ? e.message : String(e));
    const allLoaded = () => all !== null && all.length >= allTotal;
    const serverFiltering = () => activeCategoryId !== null && !allLoaded();
    function derivedCategories() {
        const seen = new Map();
        for (const e of all ?? [])
            for (const c of e.categories)
                if (!seen.has(c.id))
                    seen.set(c.id, c.name);
        return [...seen.entries()].map(([id, name]) => ({ id, name }));
    }
    function getState() {
        if (snapshot)
            return snapshot;
        const events = serverFiltering()
            ? filtered
            : all === null
                ? null
                : activeCategoryId
                    ? all.filter((e) => e.categories.some((c) => c.id === activeCategoryId))
                    : all;
        // Never before the first page is in: a "load more" under skeletons would be a lie.
        const hasMore = serverFiltering() ? filtered !== null && filtered.length < filteredTotal : activeCategoryId === null && all !== null && !allLoaded();
        snapshot = {
            events,
            categories: fetchedCategories ?? derivedCategories(),
            activeCategoryId,
            hasMore,
            loadingMore,
            error,
        };
        return snapshot;
    }
    async function loadPage(categoryId, offset) {
        const gen = generation;
        loadingMore = true;
        error = null;
        emit();
        try {
            const page = await fetchEventsPage({ limit: pageSize, offset, categoryId: categoryId ?? undefined, status });
            if (!started || gen !== generation)
                return;
            if (categoryId === null) {
                all = offset === 0 ? page.events : [...(all ?? []), ...page.events];
                allTotal = page.total;
            }
            else {
                filtered = offset === 0 ? page.events : [...(filtered ?? []), ...page.events];
                filteredTotal = page.total;
            }
        }
        catch (e) {
            if (!started || gen !== generation)
                return;
            if (categoryId === null && all === null)
                all = [];
            if (categoryId !== null && filtered === null)
                filtered = [];
            error = message(e);
        }
        finally {
            if (started && gen === generation) {
                loadingMore = false;
                emit();
            }
        }
    }
    return {
        getState,
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        start() {
            if (started)
                return;
            started = true;
            // The visitor-scope category read — a refusal is not an error state, the pills derive from the events instead.
            fetchCategories()
                .then((list) => {
                if (!started)
                    return;
                fetchedCategories = list;
                emit();
            })
                .catch(() => { });
            if (!initialEvents)
                void loadPage(null, 0);
        },
        stop() {
            started = false;
        },
        setActiveCategoryId(id) {
            if (id === activeCategoryId)
                return;
            activeCategoryId = id;
            generation++;
            filtered = null;
            filteredTotal = 0;
            loadingMore = false;
            emit();
            if (serverFiltering())
                void loadPage(id, 0);
        },
        async loadMore() {
            if (loadingMore || !getState().hasMore)
                return;
            if (serverFiltering())
                await loadPage(activeCategoryId, (filtered ?? []).length);
            else
                await loadPage(null, (all ?? []).length);
        },
    };
}
