import React, { useState, useEffect } from "react";
import "./App.css";
// Placeholder logo, replace with your company logo file
import companyLogo from "./company-logo.png";
// Standard CSS color names for color dropdown
const colorOptions = [
  "White", "Black", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Gray", "Violet", "Indigo", "Cyan", "Magenta", "Lime", "Olive", "Teal", "Navy", "Maroon", "Silver", "Gold", "Beige", "Coral", "Turquoise", "Tan", "Salmon", "Khaki", "Lavender", "Plum", "Orchid", "Ivory", "Mint", "Peach", "Chocolate", "Crimson", "Azure", "Aqua", "Fuchsia", "SlateGray", "SkyBlue", "Tomato", "Sienna", "Moccasin", "Peru", "Wheat", "SeaGreen", "ForestGreen", "RoyalBlue", "SteelBlue", "DeepPink", "HotPink", "LightBlue", "LightGreen", "LightGray", "DarkBlue", "DarkGreen", "DarkRed", "DarkOrange", "DarkViolet", "DarkMagenta", "DarkCyan", "DarkSlateGray", "MediumVioletRed", "MediumSeaGreen", "MediumSlateBlue", "MediumPurple", "MediumOrchid", "MediumTurquoise", "MediumSpringGreen", "MediumAquamarine", "MediumBlue", "MediumSeaGreen", "MediumSlateBlue", "MediumTurquoise", "MediumVioletRed", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PaleGoldenRod", "LightSalmon", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightPink", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LawnGreen", "LemonChiffon", "MistyRose", "NavajoWhite", "OldLace", "PapayaWhip", "PowderBlue", "RosyBrown", "SandyBrown", "Thistle", "YellowGreen"
];
// SheetBest API endpoint
const SHEETBEST_URL = "https://api.sheetbest.com/sheets/f447a911-6ca1-4fa3-9743-d297133671a4";
function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Dynamic theme styles
  const theme = {
    background: darkMode ? '#181a20' : '#f4f6fb',
    card: darkMode ? '#23262f' : '#fff',
    text: darkMode ? '#fffbe7' : '#222', // soft yellowish white
    label: darkMode ? '#ffe066' : '#0052cc', // bright yellow for labels
    inputBg: darkMode ? '#23262f' : '#fff',
    inputBorder: darkMode ? '#ffe066' : '#d1d5db', // yellow border
    tableHeader: darkMode ? '#2d2f3a' : '#f0f4fa',
    tableBorder: darkMode ? '#ffe066' : '#e5e7eb',
        buttonBg: darkMode ? '#ffe066' : 'linear-gradient(90deg,#0052cc 60%,#007fff 100%)',
    buttonText: darkMode ? '#23262f' : '#fff', // dark text on yellow
    remarks: darkMode ? '#ffe066' : '#222',
  };
  // Company info (customize as needed)
  const companyName = "Anil International";
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");


  // Access control: owners and regular users
  const ownerUsers = [
    { username: "admin", password: "password123" },
    { username: "owner2", password: "ownerpass" }
  ];
  const regularUsers = [
    { username: "user1", password: "userpass1" },
    { username: "user2", password: "userpass2" }
  ];
  // Track role
  const [userRole, setUserRole] = useState(""); // "owner" or "user"

  // Inventory state
  const [products, setProducts] = useState([]);
  const sizeOptions = [32, 34,36,38,40,42,44,46];
  const [form, setForm] = useState({
    productId: "",
    productName: "",
    color: "",
    category: "",
    remarks: "",
    quantities: sizeOptions.reduce((acc, size) => {
      acc[size] = "";
      return acc;
    }, {})
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const isOwner = ownerUsers.some(u => u.username === username && u.password === password);
    const isUser = regularUsers.some(u => u.username === username && u.password === password);
    if (isOwner) {
      setIsLoggedIn(true);
      setUserRole("owner");
      setLoginError("");
      await fetchProducts();
    } else if (isUser) {
      setIsLoggedIn(true);
      setUserRole("user");
      setLoginError("");
      await fetchProducts();
    } else {
      setLoginError("Invalid credentials");
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setProducts([]); // Clear inventory on logout
    setUsername("");
    setPassword("");
    setLoginError("");
    setUserRole("");
  };

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
    if (isLoggedIn) {
      fetchProducts();
    } else {
      setProducts([]); // Clear inventory on logout
    }
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (sizeOptions.includes(Number(name))) {
      setForm({
        ...form,
        quantities: {
          ...form.quantities,
          [name]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddProduct = async () => {
    if (!form.productId || !form.productName || !form.color) return;
    setLoading(true);
    try {
      const productsToAdd = sizeOptions
        .filter(size => form.quantities[size] && parseInt(form.quantities[size]) > 0)
        .map((size, idx) => ({
          // Unique productId: baseId_color_size
          productId: `${form.productId}_${form.color}_${size}`,
          productName: form.productName,
          size: size,
          color: form.color,
          quantity: parseInt(form.quantities[size]),
          category: form.category,
          remarks: form.remarks,
          lastUpdated: new Date().toISOString(),
        }));
      for (const prod of productsToAdd) {
        await fetch(SHEETBEST_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prod),
        });
      }
      setForm({
        productId: "",
        productName: "",
        color: "",
        category: "",
        remarks: "",
        quantities: sizeOptions.reduce((acc, size) => {
          acc[size] = "";
          return acc;
        }, {})
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
    const idx = products.findIndex((p) => p.productId === id);
    if (idx === -1) return;
    const currentQty = products[idx].quantity;
    if (!isAdding && amount > currentQty) {
      window.alert(`Cannot remove ${amount} items. Only ${currentQty} available.`);
      return;
    }
    setLoading(true);
    try {
      const updatedProduct = {
        ...products[idx],
        quantity: isAdding ? currentQty + amount : currentQty - amount,
        lastUpdated: new Date().toISOString(),
      };
      // Delete the old row
      await fetch(`${SHEETBEST_URL}/productId/${id}`, {
        method: "DELETE",
      });
      // Add the new row
      await fetch(SHEETBEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });
      setTimeout(fetchProducts, 500);
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


  // ...existing code...

  // Calculate filtered products and total quantity (single declaration)
  const filteredProducts = products
    .slice() // copy array
    .sort((a, b) => {
      const aTime = new Date(a.lastUpdated).getTime();
      const bTime = new Date(b.lastUpdated).getTime();
      return bTime - aTime;
    })
    .filter((p) => {
      const id = p.productId ? p.productId.toLowerCase() : "";
      const name = p.productName ? p.productName.toLowerCase() : "";
      const query = searchQuery.toLowerCase();
      return id.includes(query) || name.includes(query);
    });
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div className="App" style={{ minHeight: "100vh", background: theme.background, display: "flex", alignItems: "center", justifyContent: "center", color: theme.text }}>
        <div style={{ background: theme.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem", minWidth: 350 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 32, justifyContent: "center" }}>
            <img src={companyLogo} alt="Company Logo" style={{ width: 60, height: 60, objectFit: "contain", marginRight: 18 }} />
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 28, margin: 0, color: theme.text }}>{companyName}</h1>
              <span style={{ color: theme.label, fontSize: 16 }}>Inventory Login</span>
            </div>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
              required
            />
            <button type="submit" style={{ background: theme.buttonBg, color: theme.buttonText, border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 600, fontSize: 17, cursor: "pointer", marginTop: 8, boxShadow: "0 2px 8px rgba(0,82,204,0.08)" }}>
              Login
            </button>
            <div style={{ fontSize: 13, color: theme.label, marginTop: 8 }}>
              <b>Owner:</b> admin/password123<br />
              <b>Owner:</b> owner2/ownerpass<br />
              <b>User:</b> user1/userpass1<br />
              <b>User:</b> user2/userpass2
            </div>
            {loginError && <div style={{ color: "#d32f2f", fontWeight: 500, marginTop: 8 }}>{loginError}</div>}
          </form>
          <button onClick={() => setDarkMode(!darkMode)} style={{ marginTop: 18, background: theme.buttonBg, color: theme.buttonText, border: "none", borderRadius: 6, padding: "8px 0", fontWeight: 600, fontSize: 15, cursor: "pointer", width: "100%", boxShadow: darkMode ? "0 4px 16px 0 #ffe06655, 0 2px 0 #bfae4a" : "0 4px 16px 0 #0052cc33, 0 2px 0 #0052cc55" }}>
            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="App" style={{ minHeight: "100vh", background: theme.background, padding: "2rem 0", color: theme.text }}>
      <div style={{ maxWidth: 1000, margin: "auto", background: theme.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2.5rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <img src={companyLogo} alt="Company Logo" style={{ width: 60, height: 60, objectFit: "contain", marginRight: 18 }} />
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 28, margin: 0, color: theme.text }}>{companyName}</h1>
            <span style={{ color: theme.label, fontSize: 16 }}>Inventory Management System</span>
          </div>
          <button onClick={handleLogout} style={{ marginLeft: "auto", background: theme.buttonBg, color: theme.buttonText, border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: darkMode ? "0 4px 16px 0 #ffe06655, 0 2px 0 #bfae4a" : "0 4px 16px 0 #0052cc33, 0 2px 0 #0052cc55" }}>Logout</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: 12, background: theme.buttonBg, color: theme.buttonText, border: "none", borderRadius: 6, padding: "8px 14px", fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: darkMode ? "0 4px 16px 0 #ffe06655, 0 2px 0 #bfae4a" : "0 4px 16px 0 #0052cc33, 0 2px 0 #0052cc55" }}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <input
            placeholder="🔍 Search by ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${theme.inputBorder}`, fontSize: 16, marginBottom: 8, background: theme.inputBg, color: theme.text }}
          />
        </div>

        {/* New Add Product Form (only for owners) */}
        {userRole === "owner" && (
          <div style={{ background: theme.card, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "2rem", marginBottom: 24, maxWidth: 600 }}>
            <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16, color: theme.text }}>Add Product</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <input
                  type="text"
                  name="productId"
                  placeholder="Product ID"
                  value={form.productId}
                  onChange={handleChange}
                  required
                  style={{ padding: 10, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
                />
                <input
                  type="text"
                  name="productName"
                  placeholder="Product Name"
                  value={form.productName}
                  onChange={handleChange}
                  required
                  style={{ padding: 10, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
                />
                {/* Color dropdown with custom option */}
                <div>
                  <input
                    type="text"
                    name="color"
                    list="colorOptions"
                    placeholder="Color"
                    value={form.color}
                    onChange={handleChange}
                    required
                    style={{ padding: 10, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text, width: '100%' }}
                  />
                  <datalist id="colorOptions">
                    {colorOptions.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div style={{ margin: "18px 0 0 0" }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 8, display: "block", color: theme.label }}>Enter Quantity for Each Size:</label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "18px 12px",
                  background: darkMode ? '#23262f' : '#f7f8fa',
                  borderRadius: 8,
                  padding: 16,
                  justifyContent: "flex-start"
                }}>
                  {sizeOptions.map((size, idx) => (
                    <div key={size} style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 70,
                      marginBottom: 8
                    }}>
                      <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: theme.label }}>Size {size}</label>
                      <input
                        type="number"
                        name={String(size)}
                        min="0"
                        placeholder="Qty"
                        value={form.quantities[size]}
                        onChange={handleChange}
                        style={{ width: 60, padding: 8, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 15, textAlign: "center", background: theme.inputBg, color: theme.text }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleChange}
                  style={{ padding: 10, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
                />
                <input
                  type="text"
                  name="remarks"
                  placeholder="Remarks (optional)"
                  value={form.remarks}
                  onChange={handleChange}
                  style={{ padding: 10, borderRadius: 6, border: `1px solid ${theme.inputBorder}`, fontSize: 16, background: theme.inputBg, color: theme.text }}
                />
              </div>
              <button
                onClick={handleAddProduct}
                style={{ background: theme.buttonBg, color: theme.buttonText, border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 600, fontSize: 17, cursor: "pointer", marginTop: 18, boxShadow: "0 2px 8px rgba(0,82,204,0.08)" }}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18, gap: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: 22, margin: 0, color: theme.text }}>📦 Product Inventory</h3>
          <span style={{ fontWeight: 500, fontSize: 18, color: theme.label, background: theme.card, borderRadius: 8, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,82,204,0.06)' }}>
            Total Qty: {totalQuantity}
          </span>
        </div>
        <button onClick={downloadCSV} disabled={!products.length || loading} style={{ background: darkMode ? '#23262f' : '#e0e7ff', color: theme.label, border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 16, boxShadow: darkMode ? "0 4px 16px 0 #ffe06655, 0 2px 0 #bfae4a" : "0 2px 8px rgba(0,82,204,0.08)" }}>
          Download Sheet as CSV
        </button>
        {loading && <div style={{ color: theme.label, fontWeight: 500 }}>Loading...</div>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse", fontSize: 15, background: theme.card, color: theme.text }}>
            <thead>
              <tr style={{ background: theme.tableHeader }}>
                {[
                  "Product ID",
                  "Name",
                  "Size",
                  "Color",
                  "Qty",
                  "Category",
                  "Remarks",
                  "Last Updated",
                  "Actions"
                ].map((col) => (
                  <th key={col} style={{ padding: "10px 8px", fontWeight: 600, borderBottom: `2px solid ${theme.tableBorder}` }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.productId + '-' + p.size + '-' + p.color} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: "8px 6px" }}>{p.productId}</td>
                  <td style={{ padding: "8px 6px" }}>{p.productName}</td>
                  <td style={{ padding: "8px 6px" }}>{p.size}</td>
                  <td style={{ padding: "8px 6px" }}>{p.color}</td>
                  <td style={{ padding: "8px 6px" }}>{p.quantity}</td>
                  <td style={{ padding: "8px 6px" }}>{p.category}</td>
                  <td style={{ padding: "8px 6px", color: theme.remarks }}>{p.remarks}</td>
                  <td style={{ padding: "8px 6px" }}>{new Date(p.lastUpdated).toLocaleString()}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <div>
                      {userRole === "owner" && (
                        <button onClick={() => updateQuantity(p.productId, true)} disabled={loading} style={{ background: darkMode ? '#23262f' : '#e0e7ff', color: theme.label, border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: 600, marginRight: 4, cursor: "pointer" }}>+</button>
                      )}
                      <button onClick={() => updateQuantity(p.productId, false)} disabled={loading} style={{ background: darkMode ? '#ffe066' : '#ffe0e0', color: darkMode ? '#23262f' : '#d32f2f', border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: 600, cursor: "pointer", boxShadow: darkMode ? "0 2px 8px #ffe06655, 0 1px 0 #bfae4a" : "0 2px 8px rgba(0,82,204,0.08)" }}>-</button>
                    </div>
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
