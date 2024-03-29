FROM node:14.6.0-alpine

MAINTAINER yuliang <yuliang@ciwong.com>

RUN mkdir -p /data/freelog-storage-service

WORKDIR /data/freelog-storage-service

COPY . /data/freelog-storage-service

RUN npm install  --production

ENV NODE_ENV prod
ENV EGG_SERVER_ENV prod
ENV PORT 7002
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 7002

CMD [ "npm", "start" ]
