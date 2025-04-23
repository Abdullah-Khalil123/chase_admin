"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  accountType: string;
  balance: string;
}

const ManageUser = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users");
        if (response.data.status === "success") {
          interface ApiUser {
            id: number;
            name: string;
            email: string;
            role: string;
            accountType: string;
            balance: string | number;
          }

          const fetchedUsers = response.data.data.users.map(
            (user: ApiUser) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              accountType: user.accountType,
              balance: `$${parseFloat(user.balance.toString()).toFixed(2)}`,
            })
          );
          setUsers(fetchedUsers);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const isRoleMatch = roleFilter === "All" || user.role === roleFilter;
    const isSearchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return isRoleMatch && isSearchMatch;
  });

  const handleViewUser = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      <div className="flex justify-between mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search by Name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <Select onValueChange={setRoleFilter} value={roleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-32" onClick={() => router.push("/users/add")}>
          Add User
        </Button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => handleViewUser(user.id)}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.accountType}</TableCell>
                <TableCell>{user.balance}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/users/manage/${user.id}`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/transactions/add/${user.id}`);
                    }}
                  >
                    Add Txn
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ManageUser;
