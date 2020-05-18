"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
class AppBootHook {
    constructor(app) {
        this.app = app;
        // this.test().then();
    }
    async willReady() {
        this.decodeOssConfig();
    }
    decodeOssConfig() {
        const aliOss = this.app.config.uploadConfig.aliOss;
        if (aliOss.isCryptographic) {
            aliOss.accessKeyId = crypto_helper_1.base64Decode(aliOss.accessKeyId);
            aliOss.accessKeySecret = crypto_helper_1.base64Decode(aliOss.accessKeySecret);
        }
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9GQUE4RTtBQUU5RSxNQUFxQixXQUFXO0lBRzVCLFlBQW1CLEdBQUc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixzQkFBc0I7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ1gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxlQUFlO1FBQ1gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNuRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUU7WUFDeEIsTUFBTSxDQUFDLFdBQVcsR0FBRyw0QkFBWSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsZUFBZSxHQUFHLDRCQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ2pFO0lBQ0wsQ0FBQztDQUNKO0FBbkJELDhCQW1CQyJ9