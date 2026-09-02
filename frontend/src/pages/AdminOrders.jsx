import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";

const SIZE_LABELS = { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large", "EXTRA-LARGE": "Extra-large" };
const STATUS_FLOW = ["PENDING", "IN-TRANSIT", "DELIVERED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders() {
    setError("");
    try {
      const { data } = await client.get("/orders/orders");
      // newest first
      setOrders([...data].sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't load orders.");
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, order_status) {
    setUpdatingId(id);
    setError("");
    try {
      await client.patch(`/orders/order/update/${id}`, { order_status });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleOrders = orders?.filter((o) => filter === "ALL" || o.order_status === filter);

  const counts = orders?.reduce(
    (acc, o) => {
      acc[o.order_status] = (acc[o.order_status] || 0) + 1;
      return acc;
    },
    { PENDING: 0, "IN-TRANSIT": 0, DELIVERED: 0 }
  );

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 72 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>Kitchen dashboard</h1>
      <p style={{ marginBottom: 28 }}>All orders across every customer, sorted by newest first.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["ALL", ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            className={filter === s ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : s.replace("-", " ")}
            {s !== "ALL" && counts ? ` (${counts[s] ?? 0})` : ""}
          </button>
        ))}
      </div>

      {orders === null && <p className="muted">Loading&hellip;</p>}

      {visibleOrders && visibleOrders.length === 0 && (
        <div className="empty-state card">
          <h3>Nothing here</h3>
          <p>No orders match this filter right now.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleOrders?.map((order) => (
          <div
            key={order.id}
            className="card"
            style={{ padding: 20, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}
          >
            <div style={{ minWidth: 170 }}>
              <strong>
                {order.quantity} &times; {SIZE_LABELS[order.pizza_size] || order.pizza_size}
              </strong>
              <div className="muted">
                Order #{order.id} &middot; user #{order.user_id}
              </div>
            </div>

            <StatusBadge status={order.order_status} />

            <div className="spacer" />

            <div className="field" style={{ marginBottom: 0, minWidth: 190 }}>
              <label htmlFor={`status-${order.id}`} style={{ fontSize: "0.72rem" }}>
                Update status
              </label>
              <select
                id={`status-${order.id}`}
                value={order.order_status}
                disabled={updatingId === order.id}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
