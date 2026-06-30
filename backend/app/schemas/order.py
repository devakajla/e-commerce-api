from datetime import datetime

from pydantic import BaseModel


class OrderCreate(BaseModel):
    shipping_address: str


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    total: float
    status: str
    shipping_address: str
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
