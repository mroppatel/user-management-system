import React, { useEffect, useState } from 'react'; 
import API from '../api/axiosInstance';

export default function Users() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0, limit: 10 });
  const [currentUser, setCurrentUser] = useState(null);

  // Get current logged-in user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users', { params: { q, page, limit: 10 } });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchUsers(); }, [q, page]);

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
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <input
        placeholder="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            {currentUser?.role === 'admin' && <th className="border p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.users.map(u => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              {currentUser?.role === 'admin' && (
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded mr-2">Prev</button>
        <span>Page {page}</span>
        <button disabled={page * data.limit >= data.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded ml-2">Next</button>
      </div>
    </div>
  )
}
