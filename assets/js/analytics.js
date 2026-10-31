(function () {
    'use strict';

    {{- with .gaID }}
    (function () {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id={{ . }}';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '{{ . }}');
    })();
    {{- end }}

    {{- with .ymID }}
    (function () {
        window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
        window.ym.l = 1 * new Date();

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://mc.yandex.ru/metrika/tag.js';
        document.head.appendChild(script);

        ym('{{ . }}', 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: {{ $.webvisor }}
        });
    })();
    {{- end }}
})();
