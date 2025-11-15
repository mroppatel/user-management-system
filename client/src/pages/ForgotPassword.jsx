import React from "react";
import { useForm } from "react-hook-form";
import API from "../api/axiosInstance";

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = React.useState("");

  const onSubmit = async (data) => {
    try {
      const res = await API.post("/auth/request-password-reset", data);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input
            {...register("email", { required: true })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Send Reset Link
          </button>
        </div>
      </form>

      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
