import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

function App() {
    return (
        <BrowserRouter>
            <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
                <Toaster position="top-right" />
                <Navbar />
                <Routes>
                    <Route path="/" element={<Navigate to="/products" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/orders" element={<Orders />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
