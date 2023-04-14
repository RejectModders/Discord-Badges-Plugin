//META{"name":"UserBadges","description":"Displays all available Discord badges on your profile","author":"RejectModders","version":"1.0.0","source":"https://raw.githubusercontent.com/RejectModders/Discord-Badges-Plugin/main/UserBadges.plugin.js"}*//

var UserBadges = (() => {
    'use strict';

    const badges = {
        "Early Supporter": "https://github.com/Debuggingss/discord-badges/blob/master/pngs_named/early_supporter.png?raw=true",
        "Bug Hunter": "https://github.com/Debuggingss/discord-badges/blob/master/pngs_named/bug_hunter.png?raw=true",
        "Nitro Booster": "https://github.com/Debuggingss/discord-badges/blob/master/pngs_named/boosting_discord.png?raw=true",
        "Verified Bot Developer": "https://github.com/Debuggingss/discord-badges/blob/master/pngs_named/bot_dev.png?raw=true"
    };

    const updateBadges = () => {
        const userPopout = document.querySelector('[class^="userPopout"]');
        if (!userPopout) {
            return;
        }

        const username = userPopout.querySelector('[class^="nameTag"]').textContent;
        const userBadges = userPopout.querySelector('[class^="userBadges"]');

        // Remove existing badges
        while (userBadges.firstChild) {
            userBadges.removeChild(userBadges.firstChild);
        }

        // Add new badges
        for (const badgeName in badges) {
            if (badges.hasOwnProperty(badgeName)) {
                const badgeImage = badges[badgeName];
                const badge = document.createElement('div');
                badge.style.display = 'inline-block';
                badge.style.marginLeft = '5px';
                badge.style.marginRight = '5px';
                badge.innerHTML = `
                    <div class="badge ${badgeName.replace(/ /g, '-').toLowerCase()}" style="background-image: url(${badgeImage});"></div>
                    <div class="tooltip tooltip-top">${badgeName}</div>
                `;
                userBadges.appendChild(badge);
            }
        }
    };

    // Update badges when user popout opens
    document.addEventListener('click', () => {
        setTimeout(updateBadges, 500);
    });
})();
