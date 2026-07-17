from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from models import PizzaSize, OrderStatus


class SignUpModel(BaseModel):
    username: str = Field(min_length=3, max_length=25)
    email: EmailStr
    password: str = Field(min_length=6)
    is_staff: Optional[bool] = False
    is_active: Optional[bool] = True

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "username": "johndoe",
                "email": "johndoe@gmail.com",
                "password": "password",
                "is_staff": False,
                "is_active": True,
            }
        },
    )


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_staff: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class LoginModel(BaseModel):
    username: str
    password: str


class TokenPair(BaseModel):
    access: str
    refresh: str


class OrderModel(BaseModel):
    quantity: int = Field(gt=0)
    pizza_size: PizzaSize = PizzaSize.SMALL

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"example": {"quantity": 2, "pizza_size": "LARGE"}},
    )


class OrderOut(BaseModel):
    id: int
    quantity: int
    pizza_size: PizzaSize
    order_status: OrderStatus
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class OrderStatusModel(BaseModel):
    order_status: OrderStatus = OrderStatus.PENDING

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={"example": {"order_status": "PENDING"}},
    )
