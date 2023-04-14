//META{"name":"UserBadges","description":"Displays all available Discord badges on your profile","author":"Your Name","version":"1.0.0","source":"https://example.com/UserBadges.plugin.js"}*//

class UserBadges {
    getName() {
        return "UserBadges";
    }

    getDescription() {
        return "Displays all available Discord badges on your profile";
    }

    getVersion() {
        return "1.0.0";
    }

    getAuthor() {
        return "Your Name";
    }

    start() {
        this.loadBadges();
    }

    stop() {
        $('.userBadges').remove();
    }

    loadBadges() {
        $.getJSON('https://discordapp.com/api/guilds/0/widget.json', (data) => {
            const badges = data.features;
            const userBadges = $('.userBadges');
            if (userBadges.length == 0) {
                $('.profileBadgeList').append('<div class="userBadges"></div>');
            }
            userBadges.empty();
            for (const badge of badges) {
                const badgeName = badge.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
                userBadges.append(`<div class="profileBadge ${badge}" style="background-image: url(https://discordapp.com/assets/${badge}.svg)" aria-label="${badgeName} Badge"></div>`);
            }
        });
    }
}
