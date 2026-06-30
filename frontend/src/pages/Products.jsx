import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (query = "") => {
        try {
            const res = await API.get(`/products/${query ? `?search=${query}` : ""}`);
            setProducts(res.data);
        } catch (err) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(search);
    };

    const addToCart = async (productId) => {
        if (!token) {
            toast.error("Please login first");
            return;
        }
        try {
            await API.post("/cart/items", { product_id: productId, quantity: 1 });
            toast.success("Added to cart!");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to add to cart");
        }
    };

    if (loading) return <p style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>Loading products...</p>;

    return (
        <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ color: "#fff", fontSize: "24px" }}>Products</h2>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="text" placeholder="Search products..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: "8px 12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#fff", width: "220px" }}
                    />
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#222", color: "#aaa", border: "1px solid #333", borderRadius: "4px", cursor: "pointer" }}>
                        Search
                    </button>
                </form>
            </div>

            {products.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center" }}>No products found.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {products.map((product) => (
                        <div key={product.id} style={{
                            backgroundColor: "#111", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "20px",
                            display: "flex", flexDirection: "column", justifyContent: "space-between",
                        }}>
                            <div>
                                <span style={{ fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: "#555", backgroundColor: "#1a1a1a", padding: "2px 8px", borderRadius: "3px" }}>
                                    {product.category?.name}
                                </span>
                                <h3 style={{ color: "#e0e0e0", fontSize: "16px", marginTop: "10px", marginBottom: "6px" }}>{product.name}</h3>
                                <p style={{ color: "#666", fontSize: "13px", marginBottom: "12px" }}>{product.description}</p>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ color: "#fff", fontSize: "18px", fontWeight: "600" }}>₹{product.price.toLocaleString()}</span>
                                    <span style={{ color: product.stock > 0 ? "#4ade80" : "#f87171", fontSize: "12px" }}>
                                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => addToCart(product.id)}
                                    disabled={product.stock === 0}
                                    style={{
                                        width: "100%", padding: "8px", backgroundColor: product.stock > 0 ? "#fff" : "#333",
                                        color: product.stock > 0 ? "#000" : "#666", border: "none", borderRadius: "4px",
                                        cursor: product.stock > 0 ? "pointer" : "not-allowed", fontWeight: "600", fontSize: "13px",
                                    }}>
                                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Products;
