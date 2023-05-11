FROM grafana/grafana:latest

ENV REPOSITORY="grafana-guance-datasource"
RUN yarn install
RUN yarn build
RUN mkdir /config
RUN mkdir /config/$REPOSITORY

WORKDIR /config/$REPOSITORY

COPY ./dist ./plugins/$REPOSITORY