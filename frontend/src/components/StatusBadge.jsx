import React from "react";

const LABELS = {
  PENDING: "Pending",
  "IN-TRANSIT": "In transit",
  DELIVERED: "Delivered",
};

const CLASSES = {
  PENDING: "badge-pending",
  "IN-TRANSIT": "badge-in-transit",
  DELIVERED: "badge-delivered",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${CLASSES[status] || "badge-pending"}`}>
      {LABELS[status] || status}
    </span>
  );
}
