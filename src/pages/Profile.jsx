import React, { useEffect, useState } from "react";
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
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await getUserProfile();

        if (response?.status === "success") {
          setUser(response.data);
          setEditData(response.data);
        } else {
          setMessage("Failed to load profile");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setMessage(error?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleDateString();
  };

  const handleEdit = () => {
    setEditData({ ...user });
    setMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
    setMessage("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = () => {
    /*
     * UPDATE PROFILE API NOT AVAILABLE YET
     *
     * When backend provides the update-profile API,
     * call updateUserProfile(editData) here.
     *
     * Example:
     *
     * const response = await updateUserProfile({
     *   name: editData.name,
     *   email: editData.email,
     * });
     *
     * For now we don't pretend that the profile
     * was saved to the backend.
     */

    setMessage("Profile update API is not available yet.");
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
        <div className="error">
          {message || "Failed to load profile"}
        </div>
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
              {getInitials(user.name)}
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

          {message && (
            <div className="message">
              {message}
            </div>
          )}

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
                <p>{user.email || "N/A"}</p>
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
                <p>{user.name || "N/A"}</p>
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
                <p>{user.role || "N/A"}</p>
              )}
            </div>

            <div className="field-group">
              <label>Tenant ID</label>
              <p>{user.tenantId || "N/A"}</p>
            </div>

            <div className="field-group">
              <label>Member Since</label>
              <p>{formatDate(user.createdAt)}</p>
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
      </div>
    </div>
  );
};

export default Profile;