import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

SEVERITY_RANK = {"critical": 0, "warning": 1, "info": 2}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _load(name: str) -> list[dict]:
    with (DATA_DIR / name).open(encoding="utf-8") as handle:
        return json.load(handle)


def mop_for_model(model_number: str, mops: list[dict]) -> dict | None:
    matches = [
        mop for mop in mops if model_number.startswith(mop["applicable_model"])
    ]
    if not matches:
        return None
    return max(matches, key=lambda mop: len(mop["applicable_model"]))


def asset_for_label(equipment_label: str | None, assets: list[dict]) -> dict | None:
    label = normalize(equipment_label or "")
    if not label:
        return None
    matches = [
        asset
        for asset in assets
        if (model := normalize(asset["model_number"])) and model in label
    ]
    if not matches:
        return None
    return max(matches, key=lambda asset: len(normalize(asset["model_number"])))


def alarm_queue() -> list[dict]:
    asset_list = _load("assets.json")
    assets = {asset["asset_id"]: asset for asset in asset_list}
    mops = _load("mops.json")
    rows = []

    for alarm in _load("alarms.json"):
        asset = assets.get(alarm.get("asset_id")) if alarm.get("asset_id") else None
        suggested = False
        if asset is None:
            asset = asset_for_label(alarm.get("equipment_label"), asset_list)
            suggested = asset is not None
        mop = mop_for_model(asset["model_number"], mops) if asset else None
        rows.append(
            {
                **alarm,
                "asset": asset,
                "asset_suggested": suggested,
                "asset_attached": asset is not None and not suggested,
                "mop": mop,
            }
        )

    rows.sort(
        key=lambda row: (
            SEVERITY_RANK.get(row["severity"], 99),
            row["timestamp"],
        )
    )
    return rows
