# grafana-guance-datasource 开发

本插件目的为在 Grafana 中展示观测云数据。

## 开发
1. 安装依赖
```
yarn install
```

2. 启动本项目
```
yarn watch
```

3. 启动 grafana
```
docker-compose up
```

4. 访问页面 http://localhost:3000/

## 发测试环境
1. 打包
```
yarn run publish
```

2. 重启 Rancher



## 参考文档
1. [Development with local Grafana](https://grafana.com/docs/grafana/latest/developers/plugins/development-with-local-grafana/)
2. [Grafana Developer guide](https://github.com/grafana/grafana/blob/HEAD/contribute/developer-guide.md)
3. [Build a data source plugin](https://grafana.com/tutorials/build-a-data-source-plugin/)
4. [Build a plugin](https://grafana.com/docs/grafana/latest/developers/plugins/)
5. [Grafana UI](https://developers.grafana.com/ui/latest/index.html)
