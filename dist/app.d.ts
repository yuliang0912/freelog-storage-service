export default class AppBootHook {
    private readonly app;
    constructor(app: any);
    willReady(): Promise<void>;
    decodeOssConfig(): void;
}
