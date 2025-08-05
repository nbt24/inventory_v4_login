
import React, { useState, useEffect } from "react";
import "./App.css";


// SheetBest API endpoint
const SHEETBEST_URL = "https://api.sheetbest.com/sheets/f447a911-6ca1-4fa3-9743-d297133671a4";


function App() {
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

  // Fetch products from SheetBest
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
    fetchProducts();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Add product to SheetBest
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
      await fetchProducts(); // Refetch after add
    } catch (e) {
      alert("Failed to add product to SheetBest.");
    }
    setLoading(false);
  };

  // Update quantity in SheetBest
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
      await fetchProducts(); // Refetch after update
    } catch (e) {
      alert("Failed to update product in SheetBest.");
    }
    setLoading(false);
  };
  // Download products as CSV
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


  return (
    <div className="App" style={{ padding: "2rem", maxWidth: 900, margin: "auto" }}>
      <h2>🧾 Clothing Inventory Manager (Google Sheets Sync)</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Search by ID or Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[
          "productId",
          "productName",
          "size",
          "color",
          "quantity",
          "price",
          "category",
          "brand",
        ].map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            placeholder={key}
            onChange={handleChange}
          />
        ))}
        <button onClick={handleAddProduct} disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </div>

      <h3>📦 Product Inventory</h3>
      <button onClick={downloadCSV} disabled={!products.length || loading} style={{ marginBottom: 10 }}>
        Download Sheet as CSV
      </button>
      {loading && <div>Loading...</div>}

      <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            {[
              "Product ID",
              "Name",
              "Size",
              "Color",
              "Qty",
              "Price",
              "Category",
              "Brand",
              "Last Updated",
              "Actions",
            ].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.productId}>
              <td>{p.productId}</td>
              <td>{p.productName}</td>
              <td>{p.size}</td>
              <td>{p.color}</td>
              <td>{p.quantity}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
              <td>{p.brand}</td>
              <td>{new Date(p.lastUpdated).toLocaleString()}</td>
              <td>
                <button onClick={() => updateQuantity(p.productId, true)} disabled={loading}>+</button>
                <button onClick={() => updateQuantity(p.productId, false)} disabled={loading}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
