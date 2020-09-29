"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageCommonGenerator = void 0;
const midway_1 = require("midway");
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const lodash_1 = require("lodash");
const mime = require("mime");
let StorageCommonGenerator = class StorageCommonGenerator {
    registerMimeTypeMap() {
        const typeMap = {
            'application/json': ['ncfg']
        };
        mime.define(typeMap);
    }
    /**
     * 生成资源唯一key
     * @param {string} resourceName
     * @returns {string}
     */
    generateObjectUniqueKey(bucketName, objectName) {
        if (!lodash_1.isString(bucketName) || !lodash_1.isString(objectName) || !bucketName.length || !objectName.length) {
            throw new Error('please check args');
        }
        return crypto_helper_1.md5(`${bucketName}/${objectName}`);
    }
    generateMimeType(objectName) {
        return mime.getType(objectName) ?? 'application/octet-stream';
    }
};
__decorate([
    midway_1.init(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorageCommonGenerator.prototype, "registerMimeTypeMap", null);
StorageCommonGenerator = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], StorageCommonGenerator);
exports.StorageCommonGenerator = StorageCommonGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1jb21tb24tZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9zdG9yYWdlLWNvbW1vbi1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQTRDO0FBQzVDLG9GQUFxRTtBQUNyRSxtQ0FBZ0M7QUFDaEMsNkJBQTZCO0FBSTdCLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBRy9CLG1CQUFtQjtRQUNmLE1BQU0sT0FBTyxHQUFHO1lBQ1osa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLENBQUM7U0FDL0IsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCx1QkFBdUIsQ0FBQyxVQUFrQixFQUFFLFVBQWtCO1FBQzFELElBQUksQ0FBQyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQzVGLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN4QztRQUNELE9BQU8sbUJBQUcsQ0FBQyxHQUFHLFVBQVUsSUFBSSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxVQUFrQjtRQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksMEJBQTBCLENBQUM7SUFDbEUsQ0FBQztDQUNKLENBQUE7QUF0Qkc7SUFEQyxhQUFJLEVBQUU7Ozs7aUVBTU47QUFSUSxzQkFBc0I7SUFGbEMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTixzQkFBc0IsQ0F5QmxDO0FBekJZLHdEQUFzQiJ9