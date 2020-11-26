"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (appInfo) => {
    const config = {};
    config.keys = appInfo.name;
    config.cluster = {
        listen: {
            port: 7002,
            workers: 3
        }
    };
    config.middleware = ['errorAutoSnapHandler', 'gatewayIdentityInfoHandler'];
    config.onerror = {
        all(err, ctx) {
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({ ret: -1, msg: err.toString(), data: null });
            ctx.status = 500;
        }
    };
    config.i18n = {
        enable: true,
        defaultLocale: 'zh-CN'
    };
    config.security = {
        xframe: {
            enable: false,
        },
        csrf: {
            enable: false,
        }
    };
    config.bodyParser = {
        enable: true,
        enableTypes: ['json', 'form', 'text']
    };
    config.multipart = {
        autoFields: false,
        defaultCharset: 'utf8',
        fieldNameSize: 100,
        fieldSize: '100kb',
        fields: 20,
        fileSize: '100mb',
        files: 10,
        fileExtensions: [],
        whitelist: (fileName) => true,
    };
    config.uploadConfig = {
        aliOss: {
            enable: true,
            isCryptographic: true,
            accessKeyId: 'TFRBSTRGcGNBRWdCWm05UHlON3BhY0tU',
            accessKeySecret: 'M2NBYmRwQ1VESnpCa2ZDcnVzN1d2SXc1alhmNDNF',
            bucket: 'freelog-shenzhen',
            internal: false,
            region: 'oss-cn-shenzhen',
            timeout: 180000
        },
        amzS3: {}
    };
    config.clientCredentialInfo = {
        clientId: 1002,
        publicKey: 'ad472200bda12d65666df7b97282a7c6',
        privateKey: '9d3761da71ee041e648cafb2e322d968'
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsQ0FBQyxPQUFZLEVBQUUsRUFBRTtJQUM1QixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsSUFBSTtZQUNWLE9BQU8sRUFBRSxDQUFDO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLHNCQUFzQixFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFFM0UsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7WUFDOUIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7WUFDdEUsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDckIsQ0FBQztLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsSUFBSSxHQUFHO1FBQ1YsTUFBTSxFQUFFLElBQUk7UUFDWixhQUFhLEVBQUUsT0FBTztLQUN6QixDQUFDO0lBRUYsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLE1BQU0sRUFBRTtZQUNKLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsTUFBTSxFQUFFLEtBQUs7U0FDaEI7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFVBQVUsR0FBRztRQUNoQixNQUFNLEVBQUUsSUFBSTtRQUNaLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0tBQ3hDLENBQUM7SUFFRixNQUFNLENBQUMsU0FBUyxHQUFHO1FBQ2YsVUFBVSxFQUFFLEtBQUs7UUFDakIsY0FBYyxFQUFFLE1BQU07UUFDdEIsYUFBYSxFQUFFLEdBQUc7UUFDbEIsU0FBUyxFQUFFLE9BQU87UUFDbEIsTUFBTSxFQUFFLEVBQUU7UUFDVixRQUFRLEVBQUUsT0FBTztRQUNqQixLQUFLLEVBQUUsRUFBRTtRQUNULGNBQWMsRUFBRSxFQUFFO1FBQ2xCLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSTtLQUNoQyxDQUFDO0lBRUYsTUFBTSxDQUFDLFlBQVksR0FBRztRQUNsQixNQUFNLEVBQUU7WUFDSixNQUFNLEVBQUUsSUFBSTtZQUNaLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLFdBQVcsRUFBRSxrQ0FBa0M7WUFDL0MsZUFBZSxFQUFFLDBDQUEwQztZQUMzRCxNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixPQUFPLEVBQUUsTUFBTTtTQUNsQjtRQUNELEtBQUssRUFBRSxFQUFFO0tBQ1osQ0FBQztJQUVGLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRztRQUMxQixRQUFRLEVBQUUsSUFBSTtRQUNkLFNBQVMsRUFBRSxrQ0FBa0M7UUFDN0MsVUFBVSxFQUFFLGtDQUFrQztLQUNqRCxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=