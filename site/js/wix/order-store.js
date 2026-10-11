// The post-checkout confirmation as a framework-free store — the logic behind
// useEventConfirmation, usable from React (the hook wraps it), from a static confirmation page,
// from Vue/Svelte, or as the specification for a port. The Wix-hosted checkout redirects to the
// thank-you URL with `?orderNumber=&eventId=`; this store fetches the event for context and the
// order for its details, then polls the order every 2 s for up to 15 s until the tickets are
// generated (Wix's own thank-you page does the same) so the PDF link can appear.
//
// The order read runs on the visitor token, as Wix's headless demo does. It isn't guaranteed for
// every site's visitor scope: when it is refused, `orderUnavailable` is set and the surface shows
// the confirmation without order details — landing here IS the success signal (Wix redirects only
// after checkout completes); the tickets arrive by email regardless.
import { fetchEventById } from "./events.js";
import { fetchOrder } from "./orders.js";
import { ORDER_POLL_INTERVAL_MS, ORDER_POLL_TOTAL_MS } from "./orders-core.js";
export function createOrderStore({ orderNumber, eventId }) {
    let event = null;
    let order = null;
    let orderUnavailable = false;
    let polling = false;
    let loading = Boolean(orderNumber && eventId);
    let started = false;
    let timer = null;
    const listeners = new Set();
    let snapshot = null;
    const emit = () => {
        snapshot = null;
        for (const fn of listeners)
            fn();
    };
    function getState() {
        if (snapshot)
            return snapshot;
        snapshot = { orderNumber, eventId, event, order, orderUnavailable, polling, loading };
        return snapshot;
    }
    async function readOrder() {
        const next = await fetchOrder(eventId, orderNumber);
        if (!started)
            return true;
        if (!next) {
            orderUnavailable = order === null;
            return true; // nothing to poll for
        }
        order = next;
        return next.ticketsReady;
    }
    function schedule(elapsed) {
        if (!started || elapsed >= ORDER_POLL_TOTAL_MS) {
            polling = false;
            emit();
            return;
        }
        polling = true;
        emit();
        timer = setTimeout(async () => {
            timer = null;
            let ready = true;
            try {
                ready = await readOrder();
            }
            catch {
                /* a transient failure: keep the last order, try again until the budget is spent */
                ready = false;
            }
            if (!started)
                return;
            if (ready) {
                polling = false;
                emit();
            }
            else {
                schedule(elapsed + ORDER_POLL_INTERVAL_MS);
            }
        }, ORDER_POLL_INTERVAL_MS);
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
            if (!orderNumber || !eventId)
                return;
            fetchEventById(eventId)
                .then((e) => {
                if (!started)
                    return;
                event = e;
                emit();
            })
                .catch(() => { });
            readOrder()
                .then((ready) => {
                if (!started)
                    return;
                loading = false;
                emit();
                if (!ready)
                    schedule(0);
            })
                .catch(() => {
                if (!started)
                    return;
                // Refused for this visitor scope (or a transient failure) — degrade, never fake details.
                orderUnavailable = true;
                loading = false;
                emit();
            });
        },
        stop() {
            started = false;
            if (timer)
                clearTimeout(timer);
            timer = null;
        },
    };
}
