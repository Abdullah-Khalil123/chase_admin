"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  role: string;
  balance: string;
  availableCredit: string;
}

const AddUser = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      accountName: "",
      accountNumber: "",
      accountType: "",
      role: "User",
      balance: "0",
      availableCredit: "0",
    },
  });

  interface ApiResponse {
    status: string;
    message?: string;
  }

  interface ApiErrorResponse {
    message?: string;
    error?: string;
  }

  interface UserSubmitData {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    accountName: string;
    accountType: string;
    accountNumber: string;
    role: boolean;
    balance: number;
    availableCredit: number;
  }

  const onSubmit = async (data: UserFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError("");

      // Format the data according to the API requirements
      const userData: UserSubmitData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
        accountName: data.accountName,
        accountType: data.accountType, // Ensure accountType is included
        accountNumber: data.accountNumber,
        role: data.role === "Admin",
        balance: parseFloat(data.balance) || 0,
        availableCredit: parseFloat(data.availableCredit) || 0,
      };

      console.log("Submitting user data:", userData);

      // Make API call to register the user
      const response = await axiosInstance.post<ApiResponse>(
        "auth/register",
        userData
      );

      // Handle successful response
      if (response.data.status === "success") {
        // Redirect to users list or show success message
        router.push("/users/manage");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Error adding user:", error);
      setError(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Error adding user. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New User</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="mt-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone", { required: "Phone number is required" })}
              className="mt-2"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message?.toString()}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address", { required: "Address is required" })}
              className="mt-2"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              {...register("accountName", {
                required: "Account name is required",
              })}
              className="mt-2"
            />
            {errors.accountName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountName.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              {...register("accountNumber", {
                required: "Account number is required",
              })}
              className="mt-2"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountNumber.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              onValueChange={(value) => {
                setValue("accountType", value, { shouldValidate: true });
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Checking">Checking</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="hidden"
              {...register("accountType", {
                required: "Account type is required",
              })}
            />
            {errors.accountType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountType.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">User Role</Label>
            <Select
              defaultValue="User"
              onValueChange={(value) => {
                setValue("role", value, { shouldValidate: true });
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="hidden"
              {...register("role", { required: "Role is required" })}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="balance">Starting Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              {...register("balance")}
              className="mt-2"
            />
            {errors.balance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.balance.message?.toString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="availableCredit">Available Credit</Label>
            <Input
              id="availableCredit"
              type="number"
              step="0.01"
              {...register("availableCredit")}
              className="mt-2"
            />
            {errors.availableCredit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.availableCredit.message?.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Adding User..." : "Add User"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
