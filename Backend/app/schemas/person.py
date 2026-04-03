from datetime import date

from pydantic import BaseModel, ConfigDict


class PersonBase(BaseModel):
    full_name: str
    screen_name: str | None = None
    nationality: str
    dob: date
    gender: str | None = None
    primary_profession: str
    pan_no: str
    contact_email: str
    contact_phone: str | None = None
    agent_name: str | None = None
    agent_contact: str | None = None

class PersonCreate(PersonBase):
    pass

class PersonResponse(PersonBase):
    person_id: int
    model_config = ConfigDict(from_attributes=True)