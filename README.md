# grafana-guance-datasource 观测云数据源

本插件目的为在 Grafana 中展示观测云数据。

## 安装前

Grafana 版本要求 >=8.3.7

## 安装

1. [点击下载插件](https://static.guance.com/grafana-plugins/guance-guance-datasource.zip)

2. 找到 Grafana 配置文件，默认路径参考[官方文档](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#configuration-file-location)

3. 在配置文件中找到配置的插件目录

```
[paths]
plugins = "/path/to/grafana-plugins"
```

4. 下载的文件解压放到插件目录
```
unzip guance-guance-datasource.zip -d YOUR_PLUGIN_DIR/
```

3. 修改配置项为：
```
[plugins]
allow_loading_unsigned_plugins = guance-guance-datasource
```

4. 重启 Grafana