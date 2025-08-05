
import React, { useState, useEffect } from "react";
import "./App.css";
// Placeholder logo, replace with your company logo file
import companyLogo from "./company-logo.png";

// SheetBest API endpoint
const SHEETBEST_URL = "https://api.sheetbest.com/sheets/f447a911-6ca1-4fa3-9743-d297133671a4";
function App() {
  // Company info (customize as needed)
  const companyName = "Anil International";
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Simple hardcoded credentials
  const validUser = "admin";
  const validPass = "password123";

  // Inventory state
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    size: "",
    color: "",
    quantity: 0,
    price: "",
    category: "",
    brand: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === validUser && password === validPass) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  // ...existing code for inventory management...
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHEETBEST_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const items = data.map((row) => ({
          ...row,
          quantity: parseInt(row.quantity) || 0,
        }));
        setProducts(items);
      } else {
        setProducts([]);
      }
    } catch (e) {
      alert("Failed to fetch products from SheetBest.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchProducts();
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddProduct = async () => {
    if (!form.productId || !form.productName) return;
    const newProduct = {
      ...form,
      quantity: parseInt(form.quantity),
      lastUpdated: new Date().toISOString(),
    };
    setLoading(true);
    try {
      await fetch(SHEETBEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      setForm({
        productId: "",
        productName: "",
        size: "",
        color: "",
        quantity: 0,
        price: "",
        category: "",
        brand: "",
      });
      await fetchProducts();
    } catch (e) {
      alert("Failed to add product to SheetBest.");
    }
    setLoading(false);
  };

  const updateQuantity = async (id, isAdding) => {
    const amount = parseInt(prompt(`Enter quantity to ${isAdding ? "add" : "remove"}:`));
    if (isNaN(amount) || amount <= 0) return;
    setLoading(true);
    try {
      const idx = products.findIndex((p) => p.productId === id);
      if (idx === -1) return;
      const updatedProduct = {
        ...products[idx],
        quantity: Math.max(0, products[idx].quantity + (isAdding ? amount : -amount)),
        lastUpdated: new Date().toISOString(),
      };
      await fetch(`${SHEETBEST_URL}/productId/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
      await fetchProducts();
    } catch (e) {
      alert("Failed to update product in SheetBest.");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!products.length) return;
    const header = Object.keys(products[0]).join(",");
    const rows = products
      .map((p) => Object.values(p).map((v) => `"${v}"`).join(","))
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter(
    (p) => {
      const id = p.productId ? p.productId.toLowerCase() : "";
      const name = p.productName ? p.productName.toLowerCase() : "";
      const query = searchQuery.toLowerCase();
      return id.includes(query) || name.includes(query);
    }
  );

  // Render login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f4f6fb" }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem", minWidth: 350, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <img src={companyLogo} alt="Company Logo" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 16 }} />
          <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>{companyName}</h1>
          <h2 style={{ fontWeight: 500, fontSize: 18, marginBottom: 24, color: "#3a3a3a" }}>Inventory Manager Login</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 16 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 16 }}
            />
            <button type="submit" style={{ background: "#0052cc", color: "#fff", border: "none", borderRadius: 6, padding: "10px 0", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Login</button>
            {loginError && <div style={{ color: "#d32f2f", marginTop: 8 }}>{loginError}</div>}
          </form>
        </div>
      </div>
    );
  }

  // ...existing code for inventory UI...
  return (
    <div className="App" style={{ minHeight: "100vh", background: "#f4f6fb", padding: "2rem 0" }}>
      <div style={{ maxWidth: 1000, margin: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <img src={companyLogo} alt="Company Logo" style={{ width: 60, height: 60, objectFit: "contain", marginRight: 18 }} />
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>{companyName}</h1>
            <span style={{ color: "#888", fontSize: 16 }}>Inventory Management System</span>
          </div>
          <button onClick={handleLogout} style={{ marginLeft: "auto", background: "#0052cc", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Logout</button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            placeholder="🔍 Search by ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db", fontSize: 16, marginBottom: 8 }}
          />
        </div>

        <div style={{ display: "grid", gap: 12, marginBottom: 28, gridTemplateColumns: "repeat(4, 1fr)" }}>
          {["productId", "productName", "size", "color", "quantity", "price", "category", "brand"].map((key) => (
            <input
              key={key}
              name={key}
              value={form[key]}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 15 }}
            />
          ))}
        </div>
        <button onClick={handleAddProduct} disabled={loading} style={{ background: "#0052cc", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%", marginBottom: 24 }}>
          {loading ? "Adding..." : "Add Product"}
        </button>

        <h3 style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>📦 Product Inventory</h3>
        <button onClick={downloadCSV} disabled={!products.length || loading} style={{ background: "#e0e7ff", color: "#0052cc", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 16 }}>
          Download Sheet as CSV
        </button>
        {loading && <div style={{ color: "#0052cc", fontWeight: 500 }}>Loading...</div>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse", fontSize: 15, background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f0f4fa" }}>
                {["Product ID", "Name", "Size", "Color", "Qty", "Price", "Category", "Brand", "Last Updated", "Actions"].map((col) => (
                  <th key={col} style={{ padding: "10px 8px", fontWeight: 600, borderBottom: "2px solid #e5e7eb" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.productId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "8px 6px" }}>{p.productId}</td>
                  <td style={{ padding: "8px 6px" }}>{p.productName}</td>
                  <td style={{ padding: "8px 6px" }}>{p.size}</td>
                  <td style={{ padding: "8px 6px" }}>{p.color}</td>
                  <td style={{ padding: "8px 6px" }}>{p.quantity}</td>
                  <td style={{ padding: "8px 6px" }}>{p.price}</td>
                  <td style={{ padding: "8px 6px" }}>{p.category}</td>
                  <td style={{ padding: "8px 6px" }}>{p.brand}</td>
                  <td style={{ padding: "8px 6px" }}>{new Date(p.lastUpdated).toLocaleString()}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <button onClick={() => updateQuantity(p.productId, true)} disabled={loading} style={{ background: "#e0e7ff", color: "#0052cc", border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: 600, marginRight: 4, cursor: "pointer" }}>+</button>
                    <button onClick={() => updateQuantity(p.productId, false)} disabled={loading} style={{ background: "#ffe0e0", color: "#d32f2f", border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: 600, cursor: "pointer" }}>-</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
