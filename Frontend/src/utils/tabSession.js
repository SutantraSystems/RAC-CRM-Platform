
const TAB_ID_KEY = "rac_tab_id";
const TAB_PREFIX = "rac_tab:";


const HEARTBEAT_MS = 20 * 1000;
const STALE_MS = 150 * 1000;

const newTabId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const heartbeatKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(TAB_PREFIX)) {
            keys.push(key);
        }
    }
    return keys;
};

// Number of OTHER tabs that are still alive. Dead heartbeats are cleaned up.
const countOtherLiveTabs = (ownId) => {
    const now = Date.now();
    let alive = 0;

    heartbeatKeys().forEach((key) => {
        const seenAt = Number(localStorage.getItem(key));

        if (!seenAt || now - seenAt > STALE_MS) {
            localStorage.removeItem(key);
            return;
        }

        if (key !== TAB_PREFIX + ownId) {
            alive += 1;
        }
    });

    return alive;
};

const beat = (id) => {
    try {
        localStorage.setItem(TAB_PREFIX + id, String(Date.now()));
    } catch {
      
    }
};

const claimTab = () => {
    try {
        let id = sessionStorage.getItem(TAB_ID_KEY);
        const isNewTab = !id;

        if (!id) {
            id = newTabId();
            sessionStorage.setItem(TAB_ID_KEY, id);
        }

        const othersAlive = countOtherLiveTabs(id);
        beat(id);

        return isNewTab && othersAlive === 0;
    } catch {
        return false;
    }
};

export const isFreshBrowserSession = claimTab();

export const startTabHeartbeat = () => {
    let id = null;

    try {
        id = sessionStorage.getItem(TAB_ID_KEY);
    } catch {
        return () => {};
    }

    if (!id) {
        return () => {};
    }

    const tabId = id;
    const alive = () => beat(tabId);

    const onPageHide = () => {
        try {
            localStorage.removeItem(TAB_PREFIX + tabId);
        } catch {
           
        }
    };

    const onPageShow = () => alive();

    const onVisible = () => {
        if (document.visibilityState === "visible") {
            alive();
        }
    };

    alive();
    const timer = setInterval(alive, HEARTBEAT_MS);

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
        clearInterval(timer);
        window.removeEventListener("pagehide", onPageHide);
        window.removeEventListener("pageshow", onPageShow);
        document.removeEventListener("visibilitychange", onVisible);
    };
};