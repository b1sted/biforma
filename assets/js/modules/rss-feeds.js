export function initRssFeeds() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.rss-feed-card');
        if (card && !e.target.closest('.rss-copy-btn, code')) {
            window.open(card.dataset.rssUrl, '_blank');
        }
    });
}
