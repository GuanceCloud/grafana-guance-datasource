import React, { ChangeEvent } from 'react';
import { InlineField, Input, LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

const { SecretFormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onEndpointChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      endpoint: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  const onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  const onResetAPIKey = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField
        label="Endpoint"
        labelWidth={12}
        interactive={true}
        tooltip={
            <>
              {'Guance Open API Endpint, as defined in '}
              <a
                href="https://docs.guance.com/en/open-api/#support-endpoint"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              {'.'}
            </>
          }
        >
        <Input
          onChange={onEndpointChange}
          value={jsonData.endpoint || ''}
          placeholder="https://openapi.guance.com"
          width={40}
        />
      </InlineField>

      <SecretFormField
        label="API Key"
        labelWidth={6}
        tooltip="Guance API Key ID, generate in Guance > Management > Api Key > Key ID."
        isConfigured={Boolean(secureJsonFields && secureJsonFields.apiKey) as boolean}
        value={secureJsonData.apiKey || ''}
        placeholder=""
        inputWidth={20}
        onReset={onResetAPIKey}
        onChange={onAPIKeyChange}
      />
    </div>
  );
}
