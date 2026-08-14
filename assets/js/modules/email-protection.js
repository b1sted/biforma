export function initEmailProtection() {
    document.querySelectorAll('[data-email]').forEach((el) => {
        try {
            const email = atob(el.getAttribute('data-email'));
            if (email && el.tagName === 'A') {
                el.href = 'mailto:' + email;
            }
        } catch (e) {}
    });
}
