from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Cart"])


def get_or_create_cart(user: User, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def build_cart_response(cart: Cart) -> dict:
    items = []
    total = 0.0
    for item in cart.items:
        subtotal = item.product.price * item.quantity
        total += subtotal
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "product_price": item.product.price,
            "quantity": item.quantity,
            "subtotal": subtotal,
        })
    return {"id": cart.id, "items": items, "total": total}


@router.get("/", response_model=CartResponse)
def view_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(current_user, db)
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart.id)
        .first()
    )
    return build_cart_response(cart)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.quantity > product.stock:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} items in stock")

    cart = get_or_create_cart(current_user, db)

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id, CartItem.product_id == data.product_id
    ).first()

    if existing_item:
        existing_item.quantity += data.quantity
        if existing_item.quantity > product.stock:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} items in stock")
    else:
        new_item = CartItem(cart_id=cart.id, product_id=data.product_id, quantity=data.quantity)
        db.add(new_item)

    db.commit()

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart.id)
        .first()
    )
    return build_cart_response(cart)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(current_user, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if data.quantity > product.stock:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} items in stock")

    if data.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = data.quantity

    db.commit()

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart.id)
        .first()
    )
    return build_cart_response(cart)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(current_user, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
