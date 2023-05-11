import { css } from '@emotion/css';
import React from 'react';
import { QueryEditorHelpProps, DataQuery, GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

const examples = [
  {
    title: 'Basic',
    expression: "M::`cpu`:(AVG(`usage_total`))",
  },
  {
    title: 'With Variable',
    expression: "M::`cpu`:(AVG(`usage_total`)) { `host` = '$host' } BY `host`",
  },
  {
    title: 'With Multi-Select Variable',
    expression: "M::`cpu`:(AVG(`usage_user`)) { `host` IN [${host:singlequote}] } BY `host`",
  },
];

export default function QueryEditorHelp(props: QueryEditorHelpProps) {
  const styles = useStyles2(getStyles);
  return (
    <div>
      <h2>Query Help</h2>
      {examples.map((item, index) => (
        <div className="cheat-sheet-item" key={index}>
          <div className="cheat-sheet-item__title">{item.title}</div>
          {item.expression ? (
          <button
            type="button"
            className="cheat-sheet-item__example"
            onClick={(e) => props.onClickExample({ refId: 'A', queryText: item.expression } as DataQuery)}
          >
            <code>{item.expression}</code>
          </button>
          ) : null}
          {/* <div className="cheat-sheet-item__label">{item.label}</div> */}
        </div>
      ))}

      <br />

      <div>
        <span>For more information about DQL definition, please refer to </span> 
        <a
          href="https://docs.guance.com/en/dql/define/"
          target="_blank"
          rel="noreferrer"
          className={styles.anchorTag}
        >
          here
        </a>
        .
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  anchorTag: css`
    color: ${theme.colors.text.link};
  `,
  unorderedList: css`
    list-style-type: none;
  `,
});
