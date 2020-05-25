import { MongooseModelBase, IMongooseModelBase } from './mongoose-model-base';
export declare class ResourceFileLibraryModel extends MongooseModelBase implements IMongooseModelBase {
    buildMongooseModel(): any;
    static get toObjectOptions(): {
        transform(doc: any, ret: any, options: any): Pick<any, string | number | symbol>;
    };
}
