# 开发手册

本插件目的为在 Grafana 中展示观测云数据。

## 首次配置

1. 安装本地 Grafana 应用，可参考[官方文档](https://github.com/grafana/grafana/blob/HEAD/contribute/developer-guide.md)，确保可通过 http://localhost:3000/ 正常访问
2. 准备好插件项目代码，编译启动 (node v18)
```
yarn install
yarn build
```
3. 插件关联到 Grafana
```
ln -s <plugin-path>/dist data/plugins/<plugin-name>
```
4. 重启 Grafana 应用，进入菜单 *Connections* -> *Connect data*，若能看到插件，即安装成功。

Tips: 以上步骤为直接安装 Grafana，也可使用 docker，参考[文档](https://grafana.com/docs/grafana/latest/developers/plugins/development-with-local-grafana/)

## 日常开发
1. 启动 grafana
```
make run
```

2. 启动本项目
```
yarn watch
```

3. 访问页面 http://localhost:3000/


## 参考文档
1. [Development with local Grafana](https://grafana.com/docs/grafana/latest/developers/plugins/development-with-local-grafana/)
2. [Grafana Developer guide](https://github.com/grafana/grafana/blob/HEAD/contribute/developer-guide.md)
3. [Build a data source plugin](https://grafana.com/tutorials/build-a-data-source-plugin/)
4. [Build a plugin](https://grafana.com/docs/grafana/latest/developers/plugins/)
5. [Grafana UI](https://developers.grafana.com/ui/latest/index.html)
