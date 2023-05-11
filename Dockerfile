# 
FROM node:18.16.0 as builder
ENV REPOSITORY="grafana-guance-datasource"
# 设置工作目录
WORKDIR /$REPOSITORY

# 复制项目所有文件
COPY . /$REPOSITORY/

# RUN yarn install
# RUN yarn build

FROM grafana/grafana:latest

COPY --from=builder /$REPOSITORY/ /plugins
RUN ls -l

