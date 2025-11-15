import React from "react";
import { useForm } from "react-hook-form";
import API from "../api/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/auth/reset-password", {
        token,
        password: data.password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000); // Redirect to login
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">New Password</label>
          <input
            type="password"
            {...register("password", { required: true })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", { required: true })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Reset Password
          </button>
        </div>
      </form>

      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
