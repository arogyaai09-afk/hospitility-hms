import { useEffect, useState } from "react";
import { getTenants } from "../api/tenants";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

export default function TenantList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const response = await getTenants();

        console.log("Tenants API Response:", response);

        setTenants(response || []);
      } catch (error) {
        console.error("Get tenants error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, []);

  return (
    <div className="doctors-page">
      <div className="page-top">
        <div className="page-title-wrap">
          <h1>Tenant List</h1>
          <span className="total-badge">Total Tenants : {tenants.length}</span>
        </div>

        <div className="page-actions">
          <button className="btn-new" onClick={() => navigate("/tenants/new")}>
            <AddIcon />
            New Tenant
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <SearchIcon />

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="doctors-table-card">
        <table>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>State</th>
              <th>Country</th>
              <th>Created Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#64748b",
                    }}
                  >
                    No tenants found.
                  </div>
                </td>
              </tr>
            ) : (
              tenants
                .filter((tenant) =>
                  tenant.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((tenant) => (
                  <tr key={tenant._id}>
                    <td>{tenant.name}</td>
                    <td>{tenant.state}</td>
                    <td>{tenant.country || "India"}</td>
                    <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                    <td></td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
