FROM grafana/grafana:latest
FROM node:18.16.0
ENV REPOSITORY="grafana-guance-datasource"

RUN mkdir /config
RUN mkdir /config/$REPOSITORY

WORKDIR /config/$REPOSITORY

RUN npm install

RUN npm run build

COPY ./dist ./plugins/$REPOSITORY