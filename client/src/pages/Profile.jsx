import React, { useState } from "react";
import API from "../api/axiosInstance";

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(null); 
  const [preview, setPreview] = useState(null); 

  if (!user) return <div>Please login</div>;

  const baseURL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:4000";

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) setPreview(URL.createObjectURL(file)); 
  };

  const save = async () => {
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (image) fd.append("profileImage", image);

      const res = await API.put(`/users/${user.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Updated");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>

      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 flex justify-center items-center">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : user.profileImage ? (
            <img
              crossOrigin="anonymous"
              src={`${baseURL}${user.profileImage}`}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 sm:text-sm">No Image</span>
          )}
        </div>

        <div className="mt-2">
          <input type="file" accept="image/*" onChange={handleImage} />
        </div>
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
