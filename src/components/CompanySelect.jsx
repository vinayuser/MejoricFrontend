import React, { useState, useEffect, useRef } from "react";
import { FaBuilding, FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";

export default function CompanySelect({
  id,
  label = "Select company",
  companies = [],
  value = "",
  onChange,
  disabled = false,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const selected = companies.find((c) => c._id === value);
  const query = search.trim().toLowerCase();
  const filtered = companies.filter(
    (c) =>
      !query ||
      c.name?.toLowerCase().includes(query) ||
      c.emailDomain?.toLowerCase().includes(query),
  );

  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (companyId) => {
    onChange?.(companyId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="corp-company-select" ref={rootRef}>
      {label ? (
        <label htmlFor={id} className="corp-auth-label">
          {label}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        className={`corp-company-select-trigger ${open ? "is-open" : ""}`}
        onClick={() => !disabled && !loading && setOpen((prev) => !prev)}
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="corp-company-select-leading">
          <FaBuilding />
        </span>
        <span
          className={`corp-company-select-value ${selected ? "has-value" : ""}`}
        >
          {loading
            ? "Loading organizations..."
            : selected
              ? selected.name
              : "Choose your organization"}
        </span>
        <FaChevronDown
          className={`corp-company-select-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="corp-company-select-menu" role="listbox">
          <div className="corp-company-select-search">
            <FaSearch className="corp-company-select-search-icon" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organization..."
              aria-label="Search organization"
            />
          </div>
          <ul className="corp-company-select-list">
            {filtered.length === 0 ? (
              <li className="corp-company-select-empty">No organizations found</li>
            ) : (
              filtered.map((company) => {
                const isSelected = company._id === value;
                return (
                  <li key={company._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`corp-company-select-option ${isSelected ? "is-selected" : ""}`}
                      onClick={() => handleSelect(company._id)}
                    >
                      <span className="corp-company-select-option-main">
                        <span className="corp-company-select-option-name">
                          {company.name}
                        </span>
                        <span className="corp-company-select-option-domain">
                          @{company.emailDomain}
                        </span>
                      </span>
                      {isSelected ? (
                        <FaCheck className="corp-company-select-check" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
