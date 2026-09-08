from pydantic import BaseModel
from typing import Optional


class BillItem(BaseModel):
    name: str
    quantity: float
    price: float
    confidence: Optional[float] = None


class Bill(BaseModel):
    items: list[BillItem]
    subtotal: float
    service_charge: float
    tax: float
    discount: float
    total: float
    confidence: Optional[float] = None