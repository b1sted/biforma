(function () {
    'use strict';

    function decodeEmail(encoded) {
        try {
            return atob(encoded);
        } catch (e) {
            return '';
        }
    }

    function initEmailProtection() {
        document.querySelectorAll('[data-email]').forEach(function (el) {
            const email = decodeEmail(el.getAttribute('data-email'));
            if (email && el.tagName === 'A') {
                el.href = 'mailto:' + email;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailProtection);
    } else {
        initEmailProtection();
    }
})();
