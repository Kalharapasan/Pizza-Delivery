from typing import List, Optional

from fastapi import APIRouter, Depends, status, Query
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Order, OrderStatus, PIZZA_PRICES
from schemas import OrderModel, OrderOut, OrderStatusModel, PaginatedOrders
from auth_utils import get_current_user, get_current_staff_user

order_router = APIRouter(prefix="/orders", tags=["orders"])


def _get_owned_order_or_404(db: Session, order_id: int, user: User) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No order with such id")
    if not user.is_staff and order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not allowed to carry out request")
    return order


def _price_for(order: OrderModel) -> float:
    unit_price = PIZZA_PRICES[order.pizza_size]
    return round(unit_price * order.quantity, 2)


@order_router.get("/")
async def hello(current_user: User = Depends(get_current_user)):
    """A sample hello world route."""
    return {"message": "Hello World"}


@order_router.post("/order", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def place_an_order(
    order: OrderModel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ## Placing an Order
    Requires `quantity` (int) and `pizza_size` (str). The total price is
    calculated server-side from a fixed price table, never trusted from the client.
    """
    new_order = Order(
        pizza_size=order.pizza_size,
        quantity=order.quantity,
        total_price=_price_for(order),
        user=current_user,
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


@order_router.get("/orders", response_model=PaginatedOrders)
async def list_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_user),
    order_status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    user_id: Optional[int] = Query(None, description="Filter by the customer's user id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """## List all orders, newest first. Only accessible by staff/superusers.

    Supports optional `order_status` and `user_id` filtering, plus `skip`/`limit` pagination.
    """
    query = db.query(Order)
    if order_status is not None:
        query = query.filter(Order.order_status == order_status)
    if user_id is not None:
        query = query.filter(Order.user_id == user_id)

    total = query.count()
    items = query.order_by(Order.id.desc()).offset(skip).limit(limit).all()

    return PaginatedOrders(items=items, total=total, skip=skip, limit=limit)


@order_router.get("/orders/{id}", response_model=OrderOut)
async def get_order_by_id(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_staff_user)):
    """## Get an order by its ID. Only accessible by staff/superusers."""
    order = db.query(Order).filter(Order.id == id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No order with such id")
    return order


@order_router.get("/user/orders", response_model=List[OrderOut])
async def get_user_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """## Get the currently logged-in user's orders, newest first."""
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()


@order_router.get("/user/order/{id}", response_model=OrderOut)
async def get_specific_order(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """## Get a specific order belonging to the currently logged-in user."""
    order = db.query(Order).filter(Order.id == id, Order.user_id == current_user.id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No order with such id")
    return order


@order_router.put("/order/update/{id}", response_model=OrderOut)
async def update_order(
    id: int,
    order: OrderModel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ## Updating an order
    Requires `quantity` (int) and `pizza_size` (str). Only the order's owner or
    staff may update it, and only while it is still PENDING.
    """
    order_to_update = _get_owned_order_or_404(db, id, current_user)

    if order_to_update.order_status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be edited",
        )

    order_to_update.quantity = order.quantity
    order_to_update.pizza_size = order.pizza_size
    order_to_update.total_price = _price_for(order)

    db.commit()
    db.refresh(order_to_update)

    return order_to_update


@order_router.patch("/order/update/{id}", response_model=OrderOut)
async def update_order_status(
    id: int,
    order: OrderStatusModel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_user),
):
    """## Update an order's status. Only accessible by staff/superusers."""
    order_to_update = db.query(Order).filter(Order.id == id).first()
    if order_to_update is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No order with such id")

    order_to_update.order_status = order.order_status
    db.commit()
    db.refresh(order_to_update)

    return order_to_update


@order_router.delete("/order/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_an_order(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """## Delete an order by its ID. Only the order's owner or staff may delete it, while it's still PENDING."""
    order_to_delete = _get_owned_order_or_404(db, id, current_user)

    if order_to_delete.order_status != OrderStatus.PENDING and not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled",
        )

    db.delete(order_to_delete)
    db.commit()

    return None
