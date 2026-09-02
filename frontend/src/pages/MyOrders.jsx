import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useToast } from "../context/ToastContext.jsx";

const SIZE_LABELS = { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large", "EXTRA-LARGE": "Extra-large" };

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: 1, pizza_size: "SMALL" });

  async function loadOrders() {
    setError("");
    try {
      const { data } = await client.get("/orders/user/orders");
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't load your orders.");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function startEdit(order) {
    setEditingId(order.id);
    setEditForm({ quantity: order.quantity, pizza_size: order.pizza_size });
  }

  async function saveEdit(id) {
    try {
      await client.put(`/orders/order/update/${id}`, editForm);
      setEditingId(null);
      showToast("Order updated");
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update this order.");
    }
  }

  async function cancelOrder(id) {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await client.delete(`/orders/order/delete/${id}`);
      showToast("Order cancelled");
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't cancel this order.");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 72 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: "2rem" }}>My orders</h1>
        <Link to="/menu" className="btn btn-primary btn-sm">
          + New order
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {orders === null && <p className="muted">Loading&hellip;</p>}

      {orders && orders.length === 0 && (
        <div className="empty-state card">
          <h3>No orders yet</h3>
          <p>When you place an order it'll show up here.</p>
          <Link to="/menu" className="btn btn-primary" style={{ marginTop: 8 }}>
            Order a pizza
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {orders?.map((order) => (
          <div key={order.id} className="card" style={{ padding: 22 }}>
            {editingId === order.id ? (
              <div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Size</label>
                    <select
                      value={editForm.pizza_size}
                      onChange={(e) => setEditForm((f) => ({ ...f, pizza_size: e.target.value }))}
                    >
                      {Object.entries(SIZE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editForm.quantity}
                      onChange={(e) => setEditForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => saveEdit(order.id)}>
                    Save changes
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "conic-gradient(from 90deg, var(--crust), var(--tomato) 40%, var(--crust))",
                    border: "2px solid var(--crust)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 180 }}>
                  <strong>
                    {order.quantity} &times; {SIZE_LABELS[order.pizza_size] || order.pizza_size}
                  </strong>
                  <div className="muted">
                    Order #{order.id} &middot; {formatDate(order.created_at)}
                  </div>
                </div>

                <StatusBadge status={order.order_status} />

                <div style={{ fontWeight: 700, color: "var(--tomato-dark)", fontFamily: "Fraunces, serif" }}>
                  ${order.total_price.toFixed(2)}
                </div>

                <div className="spacer" />

                {order.order_status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(order)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order.id)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
