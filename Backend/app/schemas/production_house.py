from pydantic import BaseModel, ConfigDict


class ProductionHouseBase(BaseModel):
    name: str
    founded_year: int | None = None
    headquarter_city: str
    headquarter_country: str
    gstin: str | None = None
    website: str | None = None
    contact_email: str

class ProductionHouseCreate(ProductionHouseBase):
    pass

class ProductionHouseResponse(ProductionHouseBase):
    house_id: int
    model_config = ConfigDict(from_attributes=True)