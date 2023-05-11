FROM grafana/grafana:latest
# FROM node:18.16.0
ENV REPOSITORY="grafana-guance-datasource"
# 复制项目所有文件
ADD . /$REPOSITORY/

# 设置工作目录
WORKDIR /$REPOSITORY

# RUN yarn install

# RUN yarn build
RUN ls -l
RUN cd /var/lib/grafana
RUN ls -l 
COPY ./dist ./plugins/$REPOSITORY