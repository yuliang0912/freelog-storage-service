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
        process.on('uncaughtException', function (error) {
            console.log('uncaughtException', error.message);
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9GQUE4RTtBQUU5RSxNQUFxQixXQUFXO0lBRzVCLFlBQW1CLEdBQUc7UUFDbEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixzQkFBc0I7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTO1FBQ1gsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxLQUFLO1lBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGVBQWU7UUFDWCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ25ELElBQUksTUFBTSxDQUFDLGVBQWUsRUFBRTtZQUN4QixNQUFNLENBQUMsV0FBVyxHQUFHLDRCQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxlQUFlLEdBQUcsNEJBQVksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDakU7SUFDTCxDQUFDO0NBQ0o7QUF0QkQsOEJBc0JDIn0=