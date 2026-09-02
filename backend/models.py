import enum
from datetime import datetime, timezone
from database import Base
from sqlalchemy import Column, Integer, Boolean, Text, String, ForeignKey, Enum as SAEnum, DateTime, Float
from sqlalchemy.orm import relationship


class PizzaSize(str, enum.Enum):
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"
    EXTRA_LARGE = "EXTRA-LARGE"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN-TRANSIT"
    DELIVERED = "DELIVERED"


# Single source of truth for pricing, used when an order is placed.
PIZZA_PRICES = {
    PizzaSize.SMALL: 6.50,
    PizzaSize.MEDIUM: 9.50,
    PizzaSize.LARGE: 13.00,
    PizzaSize.EXTRA_LARGE: 16.50,
}


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    username = Column(String(25), unique=True, nullable=False, index=True)
    email = Column(String(80), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    is_staff = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    quantity = Column(Integer, nullable=False)
    order_status = Column(SAEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    pizza_size = Column(SAEnum(PizzaSize), default=PizzaSize.SMALL, nullable=False)
    total_price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("user.id"))

    user = relationship("User", back_populates="orders")

    def __repr__(self):
        return f"<Order {self.id}>"

