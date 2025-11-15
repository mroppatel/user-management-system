import React from 'react';
import { useForm } from 'react-hook-form';
import API from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Google Login Handler
  const loginWithGoogle = async () => {
    try {
      const res = await API.get('/auth/google/url');
      window.location.href = res.data.url; // Redirect to Google
    } catch (err) {
      alert("Google Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input {...register('email', { required: true })} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Password</label>
          <input type="password" {...register('password', { required: true })} className="w-full border p-2 rounded" />
        </div>

        <div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
            Login
          </button>
        </div>
      </form>
      <div className="mt-3">
        <Link to="/forgot-password" className="text-blue-600">
          Forgot Password?
        </Link>
      </div>

      <div className="mt-4">
        <button
          onClick={loginWithGoogle}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Login with Google
        </button>
      </div>

      <div className="mt-3">
        <Link to="/register" className="text-blue-600">Register</Link>
      </div>
    </div>
  );
}
