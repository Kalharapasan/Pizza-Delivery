import React, { useEffect, useState } from "react";
import client from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useToast } from "../context/ToastContext.jsx";

const SIZE_LABELS = { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large", "EXTRA-LARGE": "Extra-large" };
const STATUS_FLOW = ["PENDING", "IN-TRANSIT", "DELIVERED"];
const PAGE_SIZE = 10;

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [skip, setSkip] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders() {
    setError("");
    try {
      const { data } = await client.get("/orders/orders", {
        params: {
          skip,
          limit: PAGE_SIZE,
          ...(filter !== "ALL" ? { order_status: filter } : {}),
        },
      });
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't load orders.");
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, skip]);

  function changeFilter(next) {
    setFilter(next);
    setSkip(0);
  }

  async function updateStatus(id, order_status) {
    setUpdatingId(id);
    setError("");
    try {
      await client.patch(`/orders/order/update/${id}`, { order_status });
      showToast(`Order #${id} marked ${order_status.replace("-", " ").toLowerCase()}`);
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 72 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>Kitchen dashboard</h1>
      <p style={{ marginBottom: 28 }}>All orders across every customer, newest first.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["ALL", ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            className={filter === s ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => changeFilter(s)}
          >
            {s === "ALL" ? "All" : s.replace("-", " ")}
          </button>
        ))}
      </div>

      {orders === null && <p className="muted">Loading&hellip;</p>}

      {orders && orders.length === 0 && (
        <div className="empty-state card">
          <h3>Nothing here</h3>
          <p>No orders match this filter right now.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders?.map((order) => (
          <div
            key={order.id}
            className="card"
            style={{ padding: 20, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}
          >
            <div style={{ minWidth: 180 }}>
              <strong>
                {order.quantity} &times; {SIZE_LABELS[order.pizza_size] || order.pizza_size}
              </strong>
              <div className="muted">
                Order #{order.id} &middot; user #{order.user_id} &middot; {formatDate(order.created_at)}
              </div>
            </div>

            <StatusBadge status={order.order_status} />

            <div style={{ fontWeight: 700, color: "var(--tomato-dark)", fontFamily: "Fraunces, serif" }}>
              ${order.total_price.toFixed(2)}
            </div>

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

      {total > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 28 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={skip === 0}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
          >
            &larr; Previous
          </button>
          <span className="muted">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={skip + PAGE_SIZE >= total}
            onClick={() => setSkip((s) => s + PAGE_SIZE)}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
