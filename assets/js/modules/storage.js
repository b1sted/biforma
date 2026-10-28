const PREFIX = 'biforma:';

export const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }
};
