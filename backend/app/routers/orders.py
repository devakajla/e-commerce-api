from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user, admin_required
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_TRANSITIONS = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["shipped", "cancelled"],
    "shipped": ["delivered"],
    "delivered": [],
    "cancelled": [],
}


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.user_id == current_user.id)
        .first()
    )
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order_items = []

    for item in cart.items:
        product = item.product
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product '{product.name}' is no longer available")
        if item.quantity > product.stock:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} of '{product.name}' in stock")

        subtotal = product.price * item.quantity
        total += subtotal

        order_items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            product_price=product.price,
            quantity=item.quantity,
        ))

        product.stock -= item.quantity

    order = Order(
        user_id=current_user.id,
        total=total,
        status="pending",
        shipping_address=data.shipping_address,
        items=order_items,
    )
    db.add(order)

    for item in cart.items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )
    return order


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_next = VALID_TRANSITIONS.get(order.status, [])
    if data.status not in valid_next:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from '{order.status}' to '{data.status}'. Valid: {valid_next}",
        )

    if data.status == "cancelled":
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity

    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
