"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api
      .get("/api/user")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error(err);
        setUser(null);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Users from MongoDB:</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user._id}
            className="p-4 border rounded bg-gray-50"
          >
            <p className="font-semibold">Name: {user.name}</p>
            <p>Phone: {user.phoneNumber}</p>
            <p>Email: {user.email || "-"}</p>
          </li>
        ))}
      </ul>
      {users.length === 0 && (
        <p className="text-gray-500">No users found in database.</p>
      )}
    </div>
  );
}