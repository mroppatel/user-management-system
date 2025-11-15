import React, { useState } from "react";
import { useForm } from "react-hook-form";
import API from "../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      fd.append("email", data.email);
      fd.append("password", data.password);
      fd.append("name", data.name);
      if (data.profileImage?.[0])
        fd.append("profileImage", data.profileImage[0]);
      const res = await API.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input
            {...register("name", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.name && <small className="text-red-600">Name required</small>}
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input
            {...register("email", { required: true })}
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <small className="text-red-600">Valid email required</small>
          )}
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <small className="text-red-600">Min 6 chars</small>
          )}
        </div>
        <div>
          <label className="block text-sm">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            {...register("profileImage")}
            onChange={onFileChange}
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-24 h-24 object-cover mt-2 rounded"
            />
          )}
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </div>
      </form>
      <div className="mt-3">
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </div>
    </div>
  );
}
