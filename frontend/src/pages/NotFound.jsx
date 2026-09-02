import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-state">
      <h2>404</h2>
      <p>This slice doesn&rsquo;t exist.</p>
      <Link to="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  );
}
