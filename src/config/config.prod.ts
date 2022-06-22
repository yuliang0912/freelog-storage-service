export default () => {
    const config: any = {};

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
        logLevel: 1, // logLevel.ERROR,
        brokers: ['kafka-0.production:9092', 'kafka-1.production:9092', 'kafka-2.production:9092'],
        connectionTimeout: 3000,
        retry: {
            initialRetryTime: 5000,
            retries: 20
        }
    };


    return config;
};
