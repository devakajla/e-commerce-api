import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await API.get("/cart/");
            setCart(res.data);
        } catch (err) {
            toast.error("Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await API.put(`/cart/items/${itemId}`, { quantity });
            fetchCart();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to update");
        }
    };

    const removeItem = async (itemId) => {
        try {
            await API.delete(`/cart/items/${itemId}`);
            toast.success("Item removed");
            fetchCart();
        } catch (err) {
            toast.error("Failed to remove item");
        }
    };

    const placeOrder = async () => {
        if (!address.trim()) {
            toast.error("Please enter shipping address");
            return;
        }
        try {
            await API.post("/orders/", { shipping_address: address });
            toast.success("Order placed successfully!");
            navigate("/orders");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to place order");
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>Loading cart...</p>;

    return (
        <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px" }}>
            <h2 style={{ color: "#fff", fontSize: "24px", marginBottom: "24px" }}>Your Cart</h2>

            {!cart || cart.items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <p style={{ color: "#666", fontSize: "16px" }}>Your cart is empty</p>
                    <button onClick={() => navigate("/products")} style={{
                        marginTop: "16px", padding: "10px 24px", backgroundColor: "#fff", color: "#000",
                        border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600",
                    }}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <>
                    {cart.items.map((item) => (
                        <div key={item.id} style={{
                            backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "8px",
                            padding: "16px 20px", marginBottom: "12px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div>
                                <h3 style={{ color: "#e0e0e0", fontSize: "15px", marginBottom: "4px" }}>{item.product_name}</h3>
                                <p style={{ color: "#666", fontSize: "13px" }}>₹{item.product_price.toLocaleString()} each</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: "28px", height: "28px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#aaa", cursor: "pointer", fontSize: "14px" }}>
                                        -
                                    </button>
                                    <span style={{ color: "#fff", fontSize: "14px", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: "28px", height: "28px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#aaa", cursor: "pointer", fontSize: "14px" }}>
                                        +
                                    </button>
                                </div>
                                <span style={{ color: "#fff", fontSize: "14px", fontWeight: "600", minWidth: "80px", textAlign: "right" }}>
                                    ₹{item.subtotal.toLocaleString()}
                                </span>
                                <button onClick={() => removeItem(item.id)}
                                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "14px" }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div style={{ backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ color: "#999", fontSize: "15px" }}>Total</span>
                            <span style={{ color: "#fff", fontSize: "20px", fontWeight: "600" }}>₹{cart.total.toLocaleString()}</span>
                        </div>
                        <input
                            type="text" placeholder="Shipping address" value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ width: "100%", padding: "10px", marginBottom: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                        />
                        <button onClick={placeOrder} style={{
                            width: "100%", padding: "10px", backgroundColor: "#fff", color: "#000",
                            border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600",
                        }}>
                            Place Order
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
