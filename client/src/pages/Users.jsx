import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { debounce } from 'lodash';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0, limit: 10 });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const debounced = debounce(() => setQ(searchTerm), 500);
    debounced();
    return () => debounced.cancel();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users', { params: { q, page, limit: 10 } });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [q, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
      alert('User deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded shadow overflow-x-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">All Users</h2>

      {/* Search Input */}
      <input
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Users Table */}
      <table className="w-full border-collapse min-w-[600px] sm:min-w-full">
        <thead>
          <tr className="text-left bg-gray-100">
            <th className="border p-2 text-sm sm:text-base">ID</th>
            <th className="border p-2 text-sm sm:text-base">Name</th>
            <th className="border p-2 text-sm sm:text-base">Email</th>
            <th className="border p-2 text-sm sm:text-base">Role</th>
            {currentUser?.role === 'admin' && <th className="border p-2 text-sm sm:text-base">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center p-2">
                Loading...
              </td>
            </tr>
          ) : data.users.length === 0 ? (
            <tr>
              <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center p-2">
                No users found
              </td>
            </tr>
          ) : (
            data.users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border p-2 text-sm sm:text-base">{u.id}</td>
                <td className="border p-2 text-sm sm:text-base">{u.name}</td>
                <td className="border p-2 text-sm sm:text-base">{u.email}</td>
                <td className="border p-2 text-sm sm:text-base">{u.role}</td>
                {currentUser?.role === 'admin' && (
                  <td className="border p-2 text-sm sm:text-base">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-3 flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {Math.ceil(data.total / data.limit) || 1}</span>
          <button
            disabled={page >= Math.ceil(data.total / data.limit)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Total Users: {data.total}
        </div>
      </div>
    </div>
  );
}
