from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Order
from schemas import OrderModel, OrderOut, OrderStatusModel
from auth_utils import get_current_user, get_current_staff_user

order_router = APIRouter(prefix="/orders", tags=["orders"])


def _get_owned_order_or_404(db: Session, order_id: int, user: User) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No order with such id")
    if not user.is_staff and order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not allowed to carry out request")
    return order


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
    Requires `quantity` (int) and `pizza_size` (str)
    """
    new_order = Order(
        pizza_size=order.pizza_size,
        quantity=order.quantity,
        user=current_user,
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


@order_router.get("/orders", response_model=List[OrderOut])
async def list_all_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_staff_user)):
    """## List all orders. Only accessible by staff/superusers."""
    return db.query(Order).all()


@order_router.get("/orders/{id}", response_model=OrderOut)
async def get_order_by_id(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_staff_user)):
    """## Get an order by its ID. Only accessible by staff/superusers."""
    order = db.query(Order).filter(Order.id == id).first()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No order with such id")
    return order


@order_router.get("/user/orders", response_model=List[OrderOut])
async def get_user_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """## Get the currently logged-in user's orders."""
    return db.query(Order).filter(Order.user_id == current_user.id).all()


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
    Requires `quantity` (int) and `pizza_size` (str). Only the order's owner or staff may update it.
    """
    order_to_update = _get_owned_order_or_404(db, id, current_user)

    order_to_update.quantity = order.quantity
    order_to_update.pizza_size = order.pizza_size

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
    """## Delete an order by its ID. Only the order's owner or staff may delete it."""
    order_to_delete = _get_owned_order_or_404(db, id, current_user)

    db.delete(order_to_delete)
    db.commit()

    return None
