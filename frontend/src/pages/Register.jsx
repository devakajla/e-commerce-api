import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/auth/register", { name, email, password });
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Registration failed");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "80px auto", padding: "32px", backgroundColor: "#111", borderRadius: "8px", border: "1px solid #222" }}>
            <h2 style={{ color: "#fff", marginBottom: "24px" }}>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#fff" }} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#fff" }} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "20px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", color: "#fff" }} />
                <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#fff", color: "#000", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                    Register
                </button>
            </form>
            <p style={{ color: "#666", marginTop: "16px", textAlign: "center" }}>
                Already have an account? <Link to="/login" style={{ color: "#aaa" }}>Login</Link>
            </p>
        </div>
    );
}

export default Register;
