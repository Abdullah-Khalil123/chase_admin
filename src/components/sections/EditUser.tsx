"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  username: string; // Add username to the interface
  email: string;
  phone: string;
  address?: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  role: boolean;
  balance: number;
  availableCredit: number;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

const EditUser = () => {
  const router = useRouter();
  const searchParams = useParams();
  const userId = searchParams.id;
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserData>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`users/${userId}`);
        const userData = response.data.data.user;
        console.log("Fetched user data:", userData);
        setValue("name", userData.name);
        setValue("username", userData.username); // Set username value
        setValue("email", userData.email);
        setValue("phone", userData.phone);
        setValue("address", userData.address || "");
        setValue("accountName", userData.accountName);
        setValue("accountType", userData.accountType);
        setValue("accountNumber", userData.accountNumber);
        setValue("role", userData.role);
        setValue("balance", userData.balance);
        setValue("availableCredit", userData.availableCredit);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, setValue, router]);

  const onSubmit = async (data: UserData) => {
    try {
      const updatedData = { ...data };

      // Only add password if it's provided
      if (!data.password) {
        delete updatedData.password; // Remove password field if it's empty
      }

      await axiosInstance.patch(`/users/${userId}`, updatedData);
      toast("User updated successfully");
      router.push("/users/manage"); // After successful update, navigate back to users list
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit User Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div>
            <Label htmlFor="name">User Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              {...register("name", { required: "Full name is required" })}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div> */}

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Username"
              {...register("username", { required: "Username is required" })}
              className="mt-2"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountName">Company Name</Label>
            <Input
              id="accountName"
              placeholder="Account Name"
              {...register("accountName", {
                required: "Account name is required",
              })}
              className="mt-2"
            />
            {errors.accountName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType">Account Name</Label>
            <Input
              id="accountType"
              placeholder="Account Type"
              {...register("accountType", {
                required: "Account type is required",
              })}
              className="mt-2"
            />
            {errors.accountType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountType.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Routing Number</Label>
            <Input
              id="phone"
              placeholder="Phone Number"
              {...register("phone", { required: "Phone number is required" })}
              className="mt-2"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Account Number Field */}
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Account Number"
              {...register("accountNumber", {
                required: "Account number is required",
              })}
              className="mt-2"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              placeholder="Balance"
              type="number"
              step={0.01}
              {...register("balance", {
                required: "Balance is required",
                // valueAsNumber: true,
              })}
              className="mt-2"
            />
            {errors.balance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.balance.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="availableCredit">Available Credit</Label>
            <Input
              id="availableCredit"
              placeholder="Available Credit"
              type="number"
              step={0.01}
              {...register("availableCredit", {
                required: "Available credit is required",
                valueAsNumber: true,
              })}
              className="mt-2"
            />
            {errors.availableCredit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.availableCredit.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="role">Admin Role</Label>
            <input
              type="checkbox"
              id="role"
              {...register("role")}
              className="w-4 h-4"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="New Password"
              type="password"
              {...register("password", {
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              className="mt-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/users/manage")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
