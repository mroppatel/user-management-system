import React, { useState } from 'react';
import API from '../api/axiosInstance';

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem('user') || 'null');
  const [user, setUser] = useState(stored);
  const [name, setName] = useState(user?.name || '');

  const save = async () => {
    try {
      const fd = new FormData();
      fd.append('name', name);

      const res = await API.put(`/users/${user.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Updated');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (!user) return <div>Please login</div>;

  const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>
      <div>
        {user.profileImage ? (
          <img
            src={`${baseURL}${user.profileImage}`}
            alt="profile"
            className="w-24 h-24 object-cover rounded"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
            No Image
          </div>
        )}
      </div>
      <div className="mt-3">
        <label className="block text-sm">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="mt-3">
        <label className="block text-sm">Email</label>
        <input
          value={user.email}
          readOnly
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>
      <div className="mt-4">
        <button
          onClick={save}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
