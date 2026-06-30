import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await API.get("/orders/");
            setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case "pending": return "#eab308";
            case "confirmed": return "#3b82f6";
            case "shipped": return "#a855f7";
            case "delivered": return "#4ade80";
            case "cancelled": return "#f87171";
            default: return "#888";
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>Loading orders...</p>;

    return (
        <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px" }}>
            <h2 style={{ color: "#fff", fontSize: "24px", marginBottom: "24px" }}>My Orders</h2>

            {orders.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", padding: "60px 0" }}>No orders yet.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} style={{
                        backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "8px",
                        padding: "20px", marginBottom: "16px",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div>
                                <span style={{ color: "#666", fontSize: "12px" }}>Order #{order.id}</span>
                                <span style={{ color: "#333", margin: "0 8px" }}>•</span>
                                <span style={{ color: "#666", fontSize: "12px" }}>
                                    {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                            </div>
                            <span style={{
                                fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600",
                                color: statusColor(order.status), backgroundColor: "#1a1a1a",
                                padding: "3px 10px", borderRadius: "4px",
                            }}>
                                {order.status}
                            </span>
                        </div>

                        {order.items.map((item) => (
                            <div key={item.id} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "6px 0", borderBottom: "1px solid #1a1a1a",
                            }}>
                                <span style={{ color: "#aaa", fontSize: "13px" }}>
                                    {item.product_name} × {item.quantity}
                                </span>
                                <span style={{ color: "#aaa", fontSize: "13px" }}>
                                    ₹{(item.product_price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                            <span style={{ color: "#666", fontSize: "13px" }}>{order.shipping_address}</span>
                            <span style={{ color: "#fff", fontSize: "15px", fontWeight: "600" }}>₹{order.total.toLocaleString()}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Orders;
