import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.queue import alarm_queue

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app = FastAPI(title="Salute")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str


class SaluteResponse(BaseModel):
    message: str


class Asset(BaseModel):
    asset_id: str
    site: str
    model_number: str
    install_date: str


class Mop(BaseModel):
    mop_id: str
    title: str
    applicable_model: str
    summary: str


class Alarm(BaseModel):
    alarm_id: str
    asset_id: str | None = None
    equipment_label: str | None = None
    severity: str
    message: str
    timestamp: str
    asset: Asset | None = None
    asset_suggested: bool = False
    asset_attached: bool = False
    mop: Mop | None = None


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/salute", response_model=SaluteResponse)
def salute() -> SaluteResponse:
    return SaluteResponse(message="Salute")


@app.get("/api/alarms", response_model=list[Alarm])
def alarms() -> list[Alarm]:
    return [Alarm.model_validate(row) for row in alarm_queue()]
