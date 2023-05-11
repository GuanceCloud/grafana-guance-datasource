FROM grafana/grafana:latest

ENV REPOSITORY="grafana-guance-datasource"

RUN mkdir /config
RUN mkdir /config/$REPOSITORY

WORKDIR /config/$REPOSITORY

COPY ./dist ./plugins/$REPOSITORY