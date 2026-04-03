from pydantic import BaseModel, ConfigDict


class VendorCreate(BaseModel):
    company_name: str
    service_type: str    # VFX | EQUIPMENT_RENTAL | CATERING | SECURITY | TRANSPORT | STUDIO_HIRE
    gstin: str | None = None
    contact_name: str
    contact_phone: str
    contact_email: str
    internal_rating: int | None = None
    bank_account_no: str | None = None
    bank_ifsc: str | None = None

class VendorResponse(VendorCreate):
    vendor_id: int
    model_config = ConfigDict(from_attributes=True)