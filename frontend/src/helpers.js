export const formatClock = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(new Date(iso));

export const formatWhen = (iso) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(new Date(iso));

export const formatInstalled = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const SEVERITY_LABEL = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const severityLabel = ({ severity }) => SEVERITY_LABEL[severity] ?? severity;

export const rowContext = ({ asset, asset_suggested: suggested, equipment_label: label }) => {
  if (asset) {
    return suggested ? `${asset.asset_id} · suggested` : asset.asset_id;
  }
  return label || "No asset";
};