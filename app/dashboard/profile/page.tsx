"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  async function fetchProfile() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load profile");
        setLoading(false);
        return;
      }

      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setAvatarUrl(data.user.avatarUrl || "");

      setNewName(data.user.name || "");
      setNewEmail(data.user.email || "");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setAvatarUrl(data.avatarUrl);
      setMessage("Avatar updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();

    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSavingProfile(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        setSavingProfile(false);
        return;
      }

      setName(newName);
      setMessage("Profile updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();

    if (!newEmail.trim()) {
      setError("Email cannot be empty");
      return;
    }

    setSavingEmail(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/user/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim().toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update email");
        setSavingEmail(false);
        return;
      }

      setEmail(newEmail);
      setMessage("Email updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setSavingEmail(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Profile Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your account profile details
        </p>
      </div>

      {error && (
        <div className="mb-5 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 text-cyan-400 text-sm bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
          {message}
        </div>
      )}

      {/* AVATAR */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>

        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Photo</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Upload new avatar
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="text-sm text-gray-300"
            />

            {uploading && (
              <p className="text-sm text-gray-400 mt-2">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* UPDATE NAME */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Name</h2>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Current Name
            </label>
            <input
              value={name}
              disabled
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              New Name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
            />
          </div>

          <button
            disabled={savingProfile}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              savingProfile
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105"
            }`}
          >
            {savingProfile ? "Saving..." : "Update Name"}
          </button>
        </form>
      </div>

      {/* CHANGE EMAIL */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Change Email</h2>

        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Current Email
            </label>
            <input
              value={email}
              disabled
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              New Email
            </label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white"
            />
          </div>

          <button
            disabled={savingEmail}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              savingEmail
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105"
            }`}
          >
            {savingEmail ? "Saving..." : "Update Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
