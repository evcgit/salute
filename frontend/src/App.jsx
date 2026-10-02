import { useEffect, useRef, useState } from "react";
import "./App.css";
import { formatClock, rowContext, severityLabel } from "./helpers";
import AlarmDetail from "./alarm";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warning" },
  { id: "info", label: "Info" },
];

const App = () => {
  const [alarms, setAlarms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [severity, setSeverity] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const detailRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/alarms")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setAlarms(data);
        setSelectedId(data[0]?.alarm_id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleAlarms = alarms.filter(
    (alarm) => severity === "all" || alarm.severity === severity,
  );
  const selected = visibleAlarms.find((alarm) => alarm.alarm_id === selectedId) ?? null;

  const chooseSeverity = (next) => {
    const nextAlarms = alarms.filter(
      (alarm) => next === "all" || alarm.severity === next,
    );
    setSeverity(next);
    if (!nextAlarms.some((alarm) => alarm.alarm_id === selectedId)) {
      setSelectedId(nextAlarms[0]?.alarm_id ?? null);
    }
  };

  const selectAlarm = (alarmId) => {
    setSelectedId(alarmId);
    if (window.matchMedia("(max-width: 720px)").matches) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="app">
      <header className="top">
        <h1>Alarms</h1>
        {!loading && !error && <p className="count">{alarms.length} open</p>}
      </header>

      {loading || error ? (
        <p className={`note${error ? " is-error" : ""}`}>
          {error || "Loading alarms."}
        </p>
      ) : (
        <div className="workspace">
          <section className="queue" aria-label="Open alarms">
            <div className="filters" role="group" aria-label="Filter by severity">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`filter${severity === filter.id ? " is-active" : ""}${
                    filter.id === "all" ? "" : ` sev sev-${filter.id}`
                  }`}
                  aria-pressed={severity === filter.id}
                  onClick={() => chooseSeverity(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {visibleAlarms.length === 0 ? (
              <p className="empty">
                {alarms.length === 0
                  ? "No alarms in the queue."
                  : `No ${FILTERS.find((filter) => filter.id === severity).label.toLowerCase()} alarms.`}
              </p>
            ) : (
              <ul className="rows">
                {visibleAlarms.map((alarm) => (
                  <li key={alarm.alarm_id}>
                    <button
                      type="button"
                      className={`row${alarm.alarm_id === selectedId ? " is-selected" : ""}`}
                      onClick={() => selectAlarm(alarm.alarm_id)}
                      aria-pressed={alarm.alarm_id === selectedId}
                    >
                      <span className="row-copy">
                        <span className="row-title">{alarm.message}</span>
                        <span className="row-sub">
                          <span className={`sev sev-${alarm.severity}`}>
                            {severityLabel(alarm)}
                          </span>
                          <span className="dot" aria-hidden="true">
                            ·
                          </span>
                          {alarm.asset ? (
                            <span>{rowContext(alarm)}</span>
                          ) : (
                            <span className="sev sev-warning">No asset</span>
                          )}
                          {!alarm.asset && alarm.equipment_label && (
                            <>
                              <span className="dot" aria-hidden="true">
                                ·
                              </span>
                              <span>{alarm.equipment_label}</span>
                            </>
                          )}
                        </span>
                      </span>
                      <time dateTime={alarm.timestamp}>{formatClock(alarm.timestamp)}</time>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <AlarmDetail alarm={selected} detailRef={detailRef} />
        </div>
      )}
    </div>
  );
};

export default App;
