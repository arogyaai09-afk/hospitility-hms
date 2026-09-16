import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBack, Edit, Check, Close } from "@mui/icons-material";
import { getUserProfile } from "../api/auth";
import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.status === "success") {
        setUser(response.data);
        setEditData(response.data);
      }
    } catch (error) {
      setMessage(error.message || "Failed to load profile");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(user);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // In a real scenario, you would have an updateProfile API
    // For now, we'll just show a success message
    setMessage("Profile updated successfully!");
    setUser(editData);
    setIsEditing(false);
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowBack /> Back
        </button>
        <h1>User Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header-section">
            <div className="profile-avatar">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div className="profile-info">
              <h2>{user.name || "User"}</h2>
              <p className="role-badge">{user.role || "Staff"}</p>
            </div>
            {!isEditing && (
              <button className="edit-btn" onClick={handleEdit}>
                <Edit /> Edit Profile
              </button>
            )}
          </div>

          {message && <div className="message success">{message}</div>}

          <div className="profile-fields">
            <div className="field-group">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email || ""}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              ) : (
                <p>{user.email}</p>
              )}
            </div>

            <div className="field-group">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ""}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              ) : (
                <p>{user.name}</p>
              )}
            </div>

            <div className="field-group">
              <label>Role</label>
              {isEditing ? (
                <select
                  name="role"
                  value={editData.role || ""}
                  onChange={handleChange}
                >
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <p>{user.role}</p>
              )}
            </div>

            <div className="field-group">
              <label>Tenant ID</label>
              <p>{user.tenantId || "N/A"}</p>
            </div>

            <div className="field-group">
              <label>Member Since</label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {isEditing && (
            <div className="action-buttons">
              <button className="save-btn" onClick={handleSave}>
                <Check /> Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <Close /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Account Status</h3>
            <div className="status-item">
              <span className="status-label">Status</span>
              <span className="status-value active">Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Verified</span>
              <span className="status-value">Yes</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Security</h3>
            <button className="security-btn">Change Password</button>
            <button className="security-btn">Two-Factor Authentication</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
