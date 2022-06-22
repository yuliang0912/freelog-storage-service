"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    const config = {};
    config.mongoose = {
        url: 'mongodb://storage_service:QzA4Qzg3QTA3NDRCQTA0NDU1RUQxMjI3MTA4ODQ1MTk=@freelog-prod-public.mongodb.rds.aliyuncs.com:3717,freelog-prod-public-secondary.mongodb.rds.aliyuncs.com:3717/prod-storages?replicaSet=mgset-58730021'
    };
    config.uploadConfig = {
        aliOss: {
            internal: true,
        },
        amzS3: {}
    };
    config.kafka = {
        enable: true,
        clientId: 'freelog-storage-service',
        logLevel: 1,
        brokers: ['kafka-0.production:9092', 'kafka-1.production:9092', 'kafka-2.production:9092'],
        connectionTimeout: 3000,
        retry: {
            initialRetryTime: 5000,
            retries: 20
        }
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5wcm9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWUsR0FBRyxFQUFFO0lBQ2hCLE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztJQUV2QixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsR0FBRyxFQUFFLDhOQUE4TjtLQUN0TyxDQUFDO0lBRUYsTUFBTSxDQUFDLFlBQVksR0FBRztRQUNsQixNQUFNLEVBQUU7WUFDSixRQUFRLEVBQUUsSUFBSTtTQUNqQjtRQUNELEtBQUssRUFBRSxFQUFFO0tBQ1osQ0FBQztJQUVGLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSx5QkFBeUI7UUFDbkMsUUFBUSxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSx5QkFBeUIsRUFBRSx5QkFBeUIsQ0FBQztRQUMxRixpQkFBaUIsRUFBRSxJQUFJO1FBQ3ZCLEtBQUssRUFBRTtZQUNILGdCQUFnQixFQUFFLElBQUk7WUFDdEIsT0FBTyxFQUFFLEVBQUU7U0FDZDtLQUNKLENBQUM7SUFHRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUMifQ==