import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 32px",
            backgroundColor: "#111",
            borderBottom: "1px solid #222",
        }}>
            <Link to="/" style={{ color: "#fff", textDecoration: "none", fontSize: "20px", fontWeight: "600" }}>
                EComm
            </Link>

            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <Link to="/products" style={{ color: "#aaa", textDecoration: "none" }}>Products</Link>

                {token ? (
                    <>
                        <Link to="/cart" style={{ color: "#aaa", textDecoration: "none" }}>Cart</Link>
                        <Link to="/orders" style={{ color: "#aaa", textDecoration: "none" }}>Orders</Link>
                        <button onClick={handleLogout} style={{
                            background: "none", border: "1px solid #333", color: "#aaa",
                            padding: "6px 16px", borderRadius: "4px", cursor: "pointer",
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: "#aaa", textDecoration: "none" }}>Login</Link>
                        <Link to="/register" style={{ color: "#aaa", textDecoration: "none" }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
