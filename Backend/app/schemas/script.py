from datetime import date

from pydantic import BaseModel, ConfigDict


class ScriptCreate(BaseModel):
    project_id: int
    version_no: int
    written_by: int
    submitted_date: date
    status: str = "DRAFT"
    notes: str | None = None
    word_count: int | None = None

class ScriptUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    word_count: int | None = None

class ScriptResponse(BaseModel):
    script_id: int
    project_id: int
    version_no: int
    written_by: int
    submitted_date: date
    status: str
    notes: str | None
    word_count: int | None
    model_config = ConfigDict(from_attributes=True)