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
            ctx.body = JSON.stringify({ ret: -1, errCode: 1, msg: err.toString(), data: null });
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
        enableTypes: ['json', 'form', 'text'],
        formLimit: '50mb',
    };
    config.multipart = {
        autoFields: false,
        defaultCharset: 'utf8',
        fieldNameSize: 100,
        fieldSize: '100kb',
        fields: 20,
        fileSize: '200mb',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsQ0FBQyxPQUFZLEVBQUUsRUFBRTtJQUM1QixNQUFNLE1BQU0sR0FBUSxFQUFFLENBQUM7SUFFdkIsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7UUFDYixNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsSUFBSTtZQUNWLE9BQU8sRUFBRSxDQUFDO1NBQ2I7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLHNCQUFzQixFQUFFLDRCQUE0QixDQUFDLENBQUM7SUFFM0UsTUFBTSxDQUFDLE9BQU8sR0FBRztRQUNiLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUM7WUFDOUIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUNsRixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNyQixDQUFDO0tBQ0osQ0FBQztJQUVGLE1BQU0sQ0FBQyxJQUFJLEdBQUc7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLGFBQWEsRUFBRSxPQUFPO0tBQ3pCLENBQUM7SUFFRixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsTUFBTSxFQUFFO1lBQ0osTUFBTSxFQUFFLEtBQUs7U0FDaEI7UUFDRCxJQUFJLEVBQUU7WUFDRixNQUFNLEVBQUUsS0FBSztTQUNoQjtLQUNKLENBQUM7SUFFRixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLE1BQU0sRUFBRSxJQUFJO1FBQ1osV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDckMsU0FBUyxFQUFFLE1BQU07S0FDcEIsQ0FBQztJQUVGLE1BQU0sQ0FBQyxTQUFTLEdBQUc7UUFDZixVQUFVLEVBQUUsS0FBSztRQUNqQixjQUFjLEVBQUUsTUFBTTtRQUN0QixhQUFhLEVBQUUsR0FBRztRQUNsQixTQUFTLEVBQUUsT0FBTztRQUNsQixNQUFNLEVBQUUsRUFBRTtRQUNWLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLEtBQUssRUFBRSxFQUFFO1FBQ1QsY0FBYyxFQUFFLEVBQUU7UUFDbEIsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJO0tBQ2hDLENBQUM7SUFFRixNQUFNLENBQUMsWUFBWSxHQUFHO1FBQ2xCLE1BQU0sRUFBRTtZQUNKLE1BQU0sRUFBRSxJQUFJO1lBQ1osZUFBZSxFQUFFLElBQUk7WUFDckIsV0FBVyxFQUFFLGtDQUFrQztZQUMvQyxlQUFlLEVBQUUsMENBQTBDO1lBQzNELE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsUUFBUSxFQUFFLEtBQUs7WUFDZixNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLE9BQU8sRUFBRSxNQUFNO1NBQ2xCO1FBQ0QsS0FBSyxFQUFFLEVBQUU7S0FDWixDQUFDO0lBRUYsTUFBTSxDQUFDLG9CQUFvQixHQUFHO1FBQzFCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsU0FBUyxFQUFFLGtDQUFrQztRQUM3QyxVQUFVLEVBQUUsa0NBQWtDO0tBQ2pELENBQUM7SUFFRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==