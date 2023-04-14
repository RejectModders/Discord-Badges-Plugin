//META{"name":"UserBadges","description":"Displays all available Discord badges on your profile","author":"RejectModders","version":"1.0.0","source":"https://raw.githubusercontent.com/RejectModders/Discord-Badges-Plugin/main/UserBadges.plugin.js","requiredLibraries":["ZeresPluginLibrary"]}*//

class UserBadges {
    constructor() {
        this.badges = {};
        this.loaded = false;
        this.API_URL = 'https://discord.com/api/v9';
    }

    async start() {
        await this.loadLibrary();
        this.fetchBadges();
    }

    async loadLibrary() {
        try {
            this.ZLibrary = window.ZeresPluginLibrary;
            this.badgesModule = this.ZLibrary.WebpackModules.getByProps('getBadges');
            this.accountDetailsModule = this.ZLibrary.WebpackModules.getByProps('getToken', 'getUserSettings');
        } catch (e) {
            console.error('Error while loading ZeresPluginLibrary', e);
            this.ZLibrary = null;
        }
    }

    fetchBadges() {
        if (!this.ZLibrary || !this.accountDetailsModule) {
            setTimeout(() => this.fetchBadges(), 1000);
            return;
        }

        const { id } = this.accountDetailsModule.getUserSettings();
        if (!id) {
            console.warn('Unable to fetch user badges - user ID not found');
            return;
        }

        const token = this.accountDetailsModule.getToken();
        const headers = { 'Authorization': token };
        const url = `${this.API_URL}/users/@me/guilds`;
        const fetchOptions = { method: 'GET', headers: headers };

        fetch(url, fetchOptions)
            .then((response) => response.json())
            .then((guilds) => {
                const guildIds = guilds.map((guild) => guild.id);
                const guildRolesUrl = `${this.API_URL}/guilds/${guildIds.join(',')}/roles`;
                return fetch(guildRolesUrl, fetchOptions);
            })
            .then((response) => response.json())
            .then((roles) => {
                const roleBadges = roles
                    .filter((role) => role.tags && role.tags.includes('DISCORD_NITRO') && !role.managed) // Discord Nitro Booster
                    .map((role) => {
                        return { 'name': 'Nitro Booster', 'description': `Discord Nitro Booster - ${role.name}`, 'image': 'https://discord.com/assets/5ccabf62108d5a8074ddd95af2211727.svg' };
                    });

                const badgePromises = [
                    fetch(`${this.API_URL}/users/${id}/profile`, fetchOptions), // Profile badges
                    fetch(`${this.API_URL}/user/${id}/badges`, fetchOptions), // Community badges
                ];

                Promise.all(badgePromises)
                    .then((responses) => Promise.all(responses.map((response) => response.json())))
                    .then(([profileData, communityData]) => {
                        // Add Nitro Booster badge
                        roleBadges.forEach((badge) => {
                            this.badges[badge.name] = badge;
                        });

                        // Add profile badges
                        if (profileData.premium_since) {
                            this.badges['Nitro'] = { 'name': 'Nitro', 'description': 'Discord Nitro Subscriber', 'image': 'https://discord.com/assets/5ccabf62108d5a8074ddd95af2211727.svg' };
                        }
                        profileData.profile_badges.forEach((badgeId) => {
                            const badge = this.badgesModule.getBadges().find((b) => b.id === badgeId);
                            if (badge) {
                                this.badges[badge.name] = { 'name': badge.name, 'description': badge.description, 'image': badge.image_url };
                            }
                        });

                        // Add community badges
                        communityData.badges.forEach((badge) => {
                            this.badges[badge.name] = { 'name': badge.name, 'description': badge.description, 'image': badge.image_url };
                        });

                        this.loaded = true;
                        this.updateBadges();
                    })
                    .catch((error) => {
                        console.error('Unable to fetch user badges', error);
                    });
            });
    }

    updateBadges() {
        const userPopout = this.ZLibrary.DiscordModules.UserPopout;
        this.ZLibrary.Patcher.after(userPopout, 'default', (_, [props], res) => {
            if (!props.user || !props.user.id || !this.loaded) {
                return;
            }

            const userBadges = Object.keys(this.badges).map((key) => {
                return `<span class="badge" style="background-image: url(${this.badges[key].image});" aria-label="${this.badges[key].description}">${this.badges[key].name}</span>`;
            }).join('');

            const userInfo = res.props.children.props.children[1];
            if (userInfo && userInfo.props && userInfo.props.children) {
                const userFlags = userInfo.props.children[0];
                if (userFlags && userFlags.props && userFlags.props.children) {
                    userFlags.props.children = `${userBadges} ${userFlags.props.children}`;
                }
            }
        });
    }

    stop() {
        if (this.badgesPluginInitialized) {
            const userPopout = this.ZLibrary.DiscordModules.UserPopout;
            if (userPopout) {
                this.ZLibrary.Patcher.unpatch(userPopout.default, 'userBadges');
            }
        }
    }
}
