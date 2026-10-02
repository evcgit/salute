import React from 'react';
import { severityLabel, formatWhen, formatInstalled } from './helpers';

const AlarmDetail = ({ alarm, detailRef }) => {
  if (!alarm) {
    return (
      <aside className="detail" ref={detailRef} aria-label="Alarm detail">
        <p className="empty">Select an alarm.</p>
      </aside>
    );
  }

  const { asset, mop, equipment_label: equipmentLabel } = alarm;

  return (
    <aside className="detail" ref={detailRef} aria-label="Alarm detail">
      <header>
        <p className="detail-sub">
          <span className={`sev sev-${alarm.severity}`}>{severityLabel(alarm)}</span>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <span>{alarm.alarm_id}</span>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <time dateTime={alarm.timestamp}>{formatWhen(alarm.timestamp)}</time>
        </p>
        {!asset && <p className="missing">No asset</p>}
        <h2>{alarm.message}</h2>
      </header>

      <section className="block">
        <h3>Asset</h3>
        {asset ? (
          <>
            {alarm.asset_suggested && (
              <div className="suggest">
                <p className="hint">Matched from the equipment label.</p>
                <button type="button" className="confirm">
                  Confirm {asset.asset_id}
                </button>
              </div>
            )}
            <p className="asset-name">{asset.asset_id}</p>
            <dl className="facts">
              <div>
                <dt>Site</dt>
                <dd>{asset.site}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{asset.model_number}</dd>
              </div>
              <div>
                <dt>Installed</dt>
                <dd>{formatInstalled(asset.install_date)}</dd>
              </div>
              {equipmentLabel && (
                <div>
                  <dt>Equipment</dt>
                  <dd>{equipmentLabel}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="hint">
            {equipmentLabel
              ? `${equipmentLabel} does not match an asset.`
              : "This alarm is not linked to an asset."}
          </p>
        )}
      </section>

      <section className="block">
        <h3>Procedure</h3>
        {mop ? (
          <>
            <p className="mop-title">{mop.title}</p>
            <p className="applies">
              {mop.mop_id} · {mop.applicable_model}
            </p>
            <p className="summary">{mop.summary}</p>
          </>
        ) : (
          <p className="hint">
            {asset
              ? `No procedure for ${asset.model_number}.`
              : "Link an asset to attach a procedure."}
          </p>
        )}
      </section>
    </aside>
  );
};

export default AlarmDetail;