export function initErrorPage() {
    const btn = document.getElementById('btn-go-back');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        let lastPage = null;
        try {
            lastPage = sessionStorage.getItem('last_valid_page');
        } catch (err) {}

        if (lastPage && lastPage !== window.location.href) {
            window.location.href = lastPage;
        } else if (document.referrer && document.referrer.startsWith(window.location.origin) && document.referrer !== window.location.href) {
            window.location.href = document.referrer;
        } else {
            window.location.href = btn.dataset.homeUrl || '/';
        }
    });
}
