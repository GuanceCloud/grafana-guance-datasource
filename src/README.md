# Guance data source for Grafana

The Guance data source plugin allows you to query and visualize your [Guance](https://en.guance.com/) metrics within Grafana. 

## Requirements

This plugin has the following requirements:

- A [Guance account](https://docs.guance.com/en/billing/trail/)  
- One of the following account types:
    - Grafana Cloud: Pro customers, Advanced customers, or Pro trial users with the Enterprise plugin add-on enabled    
    - Grafana Enterprise: Customers with an activated license and a user with Grafana server or organization administration permissions  
- The Enterprise plugin add-on enabled 

## Install the Guance data source plugin

To install the data source, refer to [plugin installation](https://grafana.com/docs/grafana/latest/administration/plugin-management).

## Configuration

Configure the data source with the Endpoint and API Key, and save the data source.

![](https://raw.githubusercontent.com/GuanceCloud/grafana-guance-datasource/main/src/img/datasource.jpg)

## Get the Endpoint from Guance

The Endpoint can be found [here](https://docs.guance.com/en/open-api/#support-endpoint).

## Get an API key from Guance

API Key can be found as **API Key ID** in Guance, and you can find it in **[Guance](https://en.guance.com/) > Management > API Key > Key ID**.

1. Login to https://auth.guance.com/en/.
2. Enter **Management > API Key** and Set up an API key.
3. Add the API key to the Guance plugin.

![](https://raw.githubusercontent.com/GuanceCloud/grafana-guance-datasource/main/src/img/apikey.jpg)

> More details can be found in [API Key](https://docs.guance.com/en/management/api-key/).

## Configure the data source

Now you can configure a panel within [DQL](https://docs.guance.com/en/dql/define/) on your dashboard.

![](https://raw.githubusercontent.com/GuanceCloud/grafana-guance-datasource/main/src/img/query.jpg)