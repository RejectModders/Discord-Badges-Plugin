/**
 * @name UserBadges
 * @description Displays all available Discord badges on your profile
 * @version 1.0.0
 * @source https://raw.githubusercontent.com/RejectModders/Discord-Badges-Plugin/main/UserBadges.plugin.js
 * @author RejectModders
 */
 
module.exports = class UserBadges {
   constructor() {
      this.stylesheet = `
         .userBadges-badgeContainer {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-top: 8px;
         }

         .userBadges-badge {
            width: 24px;
            height: 24px;
            margin-right: 8px;
         }
      `;
   }

   start() {
      const badgeContainer = $(".profileBadgeList-3p_sFQ");
      if (!badgeContainer) return;

      BdApi.injectCSS("userBadges-style", this.stylesheet);

      const currentUser = BdApi.findModuleByProps("getCurrentUser").getCurrentUser();

      const badges = BdApi.findModuleByProps("getAllFlairData").getAllFlairData()
         .filter(f => f.type === "BADGE");

      if (!badges || !badges.length) return;

      const userBadges = badges.filter(badge => currentUser.flags & badge.flag);

      const badgeElements = userBadges.map(badge => `<img class="userBadges-badge" src="${badge.url}">`).join("");

      badgeContainer.append(`<div class="userBadges-badgeContainer">${badgeElements}</div>`);
   }

   stop() {
      BdApi.clearCSS("userBadges-style");
   }
};
