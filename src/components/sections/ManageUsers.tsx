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
import { Check } from "lucide-react";

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
  const [accountTypeFilter, setAccountTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get unique account types from users
  const uniqueAccountTypes = [
    "All",
    ...new Set(users.map((user) => user.accountType)),
  ];

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
    // Apply role filter
    const isRoleMatch = roleFilter === "All" || user.role === roleFilter;

    // Apply account type filter
    const isAccountTypeMatch =
      accountTypeFilter === "All" || user.accountType === accountTypeFilter;

    // Apply search based on selected field
    let isSearchMatch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      if (searchField === "name") {
        isSearchMatch = user.name.toLowerCase().includes(searchLower);
      } else if (searchField === "email") {
        isSearchMatch = user.email.toLowerCase().includes(searchLower);
      } else if (searchField === "id") {
        isSearchMatch = user.id.toString().includes(searchLower);
      } else if (searchField === "all") {
        isSearchMatch =
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.id.toString().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower) ||
          user.accountType.toLowerCase().includes(searchLower) ||
          user.balance.toLowerCase().includes(searchLower);
      }
    }

    return isRoleMatch && isAccountTypeMatch && isSearchMatch;
  });

  const handleViewUser = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  const handleClearFilters = () => {
    setRoleFilter("All");
    setAccountTypeFilter("All");
    setSearchTerm("");
    setSearchField("all");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Search In</label>
            <Select onValueChange={setSearchField} value={searchField}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select onValueChange={setRoleFilter} value={roleFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <label className="block text-sm font-medium mb-1">
              Account Type
            </label>
            <Select
              onValueChange={setAccountTypeFilter}
              value={accountTypeFilter}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueAccountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "All" ? "All Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end ml-auto">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mr-2"
            >
              Clear Filters
            </Button>
            <Button onClick={() => router.push("/users/add")}>Add User</Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded">{error}</div>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-500">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"} found
          </div>
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleViewUser(user.id)}
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role ? <Check /> : ""}</TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users match your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default ManageUser;
