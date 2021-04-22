"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_freelog_base_1 = require("egg-freelog-base");
const mongoose_1 = require("egg-freelog-base/database/mongoose");
class AppBootHook {
    constructor(app) {
        this.app = app;
    }
    async willReady() {
        this.decodeOssConfig();
        return mongoose_1.default(this.app);
    }
    decodeOssConfig() {
        const aliOss = this.app.config.uploadConfig.aliOss;
        if (aliOss.isCryptographic) {
            aliOss.accessKeyId = egg_freelog_base_1.CryptoHelper.base64Decode(aliOss.accessKeyId);
            aliOss.accessKeySecret = egg_freelog_base_1.CryptoHelper.base64Decode(aliOss.accessKeySecret);
        }
    }
}
exports.default = AppBootHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUE4QztBQUM5QyxpRUFBMEQ7QUFFMUQsTUFBcUIsV0FBVztJQUc1QixZQUFtQixHQUFHO1FBQ2xCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUztRQUNYLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixPQUFPLGtCQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxlQUFlO1FBQ1gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNuRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUU7WUFDeEIsTUFBTSxDQUFDLFdBQVcsR0FBRywrQkFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLGVBQWUsR0FBRywrQkFBWSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDOUU7SUFDTCxDQUFDO0NBQ0o7QUFuQkQsOEJBbUJDIn0=