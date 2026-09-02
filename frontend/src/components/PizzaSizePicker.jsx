import React from "react";

const SIZES = [
  { value: "SMALL", label: "Small", inches: '9"', diameter: 40 },
  { value: "MEDIUM", label: "Medium", inches: '12"', diameter: 54 },
  { value: "LARGE", label: "Large", inches: '15"', diameter: 68 },
  { value: "EXTRA-LARGE", label: "XL", inches: '18"', diameter: 82 },
];

export default function PizzaSizePicker({ value, onChange }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {SIZES.map((size) => {
        const active = value === size.value;
        return (
          <button
            type="button"
            key={size.value}
            onClick={() => onChange(size.value)}
            aria-pressed={active}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "18px 8px 14px",
              borderRadius: "var(--radius-md)",
              border: active ? "2px solid var(--tomato)" : "2px solid var(--border)",
              background: active ? "var(--surface-alt)" : "var(--surface)",
              cursor: "pointer",
              transition: "border-color 0.12s ease, background 0.12s ease",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 90,
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: size.diameter,
                  height: size.diameter,
                  borderRadius: "50%",
                  background: active
                    ? "conic-gradient(from 90deg, var(--crust), var(--tomato) 40%, var(--crust))"
                    : "var(--crust-light)",
                  border: `3px solid ${active ? "var(--crust)" : "var(--border)"}`,
                  position: "relative",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "30%",
                    left: "35%",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--basil)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "55%",
                    left: "55%",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--basil)",
                  }}
                />
              </div>
            </div>
            <strong style={{ fontSize: "0.9rem" }}>{size.label}</strong>
            <span className="muted" style={{ fontSize: "0.78rem" }}>
              {size.inches}
            </span>
          </button>
        );
      })}
    </div>
  );
}
