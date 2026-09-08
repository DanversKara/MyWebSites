/* ============================================================
   Lindsay.City — Donor Recognition & Placement Injector
   ------------------------------------------------------------
   Drop this + donor-banners.css into any page (already done for
   all pages in this site) and it will automatically add:
     - a top strip banner (below the nav) linking to an active
       supporter's brand, channel, or site
     - a scrolling supporter ticker (Twitch-credits style),
       each item clickable through to the supporter's link
     - a mid-page banner (placed at the page's visual midpoint)
     - a footer strip banner (just above the site footer)
     - left/right sidebar spotlight slots (desktop only)

   This is a paid-placement-via-recurring-donation system: a
   supporter's placement stays live as long as their support
   continues, and rotates out if it lapses. Personal names are
   never shown by default — only what the supporter has chosen
   to be linked/credited as (a brand, handle, or channel), unless
   they've separately asked to be named. Higher tiers may also
   get a spoken/on-screen thank-you in video credits — see
   donor-program.pdf for the exact policy this reflects.

   TO GO LIVE: replace SAMPLE_DONORS below with real, current
   supporters and their actual links, and swap the placeholder
   slot contents for their actual submitted banner/photo/video.
   ============================================================ */

(function () {
    // Placeholder sample data — replace with real active-supporter records.
    // "link" is where the placement points (their site, channel, or profile).
    // Personal names are never shown here — only what the supporter has
    // chosen to be linked/credited as (a brand, handle, or channel name),
    // unless they've separately asked to be named. See donor-program.pdf.
    const SAMPLE_DONORS = [
        { name: "Example Shop", amount: 10, link: "#" },
        { name: "@LindsayCyclist", amount: 15, link: "#" },
        { name: "Grove Coffee Co.", amount: 25, link: "#" },
        { name: "Example Streamer", amount: 10, link: "#" },
    ];

    function donorLinkHTML(d) {
        const label = '<b>' + d.name + '</b> — supporting this site since $' + d.amount + '/mo. Thank you!';
        return d.link
            ? '<a href="' + d.link + '" target="_blank" rel="noopener">' + label + '</a>'
            : '<span>' + label + '</span>';
    }

    function slotHTML(label, sub) {
        return (
            '<div class="donor-slot-label">' + label + '</div>' +
            '<div class="donor-slot-sub">' + sub + '</div>' +
            '<img class="donor-slot-media" alt="Donor recognition photo">'
        );
    }

    function buildTicker() {
        const wrap = document.createElement('div');
        wrap.className = 'donor-ticker';
        const track = document.createElement('div');
        track.className = 'donor-ticker-track';
        const items = SAMPLE_DONORS.map(function (d) {
            return '<span class="donor-ticker-item">' + donorLinkHTML(d) + '</span>';
        }).join('');
        // duplicate content so the loop reads seamlessly
        track.innerHTML = items + items;
        wrap.appendChild(track);
        return wrap;
    }

    function buildSlot(kind, label, sub) {
        const div = document.createElement('div');
        div.className = 'donor-slot donor-slot-' + kind;
        div.innerHTML = slotHTML(label, sub);
        return div;
    }

    function buildSidebar(side) {
        const div = document.createElement('div');
        div.className = 'donor-slot donor-sidebar donor-sidebar-' + side;
        div.innerHTML = slotHTML('Supporter Spotlight', 'Photo, video, or link \u2014 reserved for a higher-tier active supporter');
        return div;
    }

    function insertAfterNav() {
        const nav = document.querySelector('.main-nav');
        if (!nav) return;
        const topSlot = buildSlot('top', 'Featured Supporter Placement', 'Reserved for an active supporter\u2019s brand, channel, or site — linked through, updated as support continues.');
        nav.insertAdjacentElement('afterend', topSlot);
        topSlot.insertAdjacentElement('afterend', buildTicker());
    }

    function insertBeforeFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        const slot = buildSlot('footer', 'Supporters Keeping This Site Running', 'Active-supporter placements, linked through to their brand, channel, or site.');
        footer.insertAdjacentElement('beforebegin', slot);
    }

    function insertAtMidpoint() {
        const body = document.body;
        const children = Array.prototype.filter.call(body.children, function (el) {
            return !['SCRIPT', 'STYLE'].includes(el.tagName) &&
                   !el.classList.contains('clouds-bg') &&
                   !el.classList.contains('sun') &&
                   !el.classList.contains('tree') &&
                   !el.classList.contains('donor-slot') &&
                   !el.classList.contains('donor-ticker') &&
                   !el.classList.contains('donor-sidebar');
        });
        if (children.length < 2) return;

        const heights = children.map(function (el) { return el.getBoundingClientRect().height; });
        const total = heights.reduce(function (a, b) { return a + b; }, 0);
        let running = 0, insertAfterEl = children[0];
        for (let i = 0; i < children.length; i++) {
            running += heights[i];
            if (running >= total / 2) { insertAfterEl = children[i]; break; }
        }
        // Don't insert directly above the footer — that's the footer slot's job.
        if (insertAfterEl.tagName === 'FOOTER') return;

        const midSlot = buildSlot('mid', 'Supporter Placement', 'Rotates among current supporters — links out to their brand, channel, or site.');
        insertAfterEl.insertAdjacentElement('afterend', midSlot);
    }

    function insertSidebars() {
        document.body.appendChild(buildSidebar('left'));
        document.body.appendChild(buildSidebar('right'));
    }

    document.addEventListener('DOMContentLoaded', function () {
        insertAfterNav();
        insertBeforeFooter();
        insertSidebars();
        // Run after layout settles so height math for the midpoint is accurate.
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(insertAtMidpoint);
        });
    });
})();
