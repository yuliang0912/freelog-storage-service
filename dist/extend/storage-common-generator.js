"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageCommonGenerator = void 0;
const midway_1 = require("midway");
const crypto_helper_1 = require("egg-freelog-base/app/extend/helper/crypto_helper");
const lodash_1 = require("lodash");
let StorageCommonGenerator = class StorageCommonGenerator {
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
};
StorageCommonGenerator = __decorate([
    midway_1.provide(),
    midway_1.scope('Singleton')
], StorageCommonGenerator);
exports.StorageCommonGenerator = StorageCommonGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1jb21tb24tZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9zdG9yYWdlLWNvbW1vbi1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUNBQXNDO0FBQ3RDLG9GQUFxRTtBQUNyRSxtQ0FBZ0M7QUFJaEMsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFFL0I7Ozs7T0FJRztJQUNILHVCQUF1QixDQUFDLFVBQWtCLEVBQUUsVUFBa0I7UUFDMUQsSUFBSSxDQUFDLGlCQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDNUYsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsT0FBTyxtQkFBRyxDQUFDLEdBQUcsVUFBVSxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUNKLENBQUE7QUFiWSxzQkFBc0I7SUFGbEMsZ0JBQU8sRUFBRTtJQUNULGNBQUssQ0FBQyxXQUFXLENBQUM7R0FDTixzQkFBc0IsQ0FhbEM7QUFiWSx3REFBc0IifQ==