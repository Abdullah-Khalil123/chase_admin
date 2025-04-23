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
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { useRouter, useParams } from "next/navigation";
// import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface TransactionFormData {
  email: string;
  type: "credit" | "debit" | "ach" | "wire" | "fee" | "other";
  description: string;
  amount: string;
  date: string;
  isReceiving: boolean; // Added isReceiving field
}

const AddUserTransaction = () => {
  const router = useRouter();
  const userEmail = decodeURIComponent(useParams().id as string);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    defaultValues: {
      isReceiving: true, // Default to receiving transaction
    },
  });
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [updatedBalance, setUpdatedBalance] = useState<number | null>(null);

  // Watch amount, type and isReceiving changes to calculate updated balance
  const amount = watch("amount");
  const type = watch("type");
  const isReceiving = watch("isReceiving");

  // Calculate updated balance when amount, type or isReceiving changes
  React.useEffect(() => {
    if (currentBalance !== null && amount) {
      const amountNum = parseFloat(amount);
      let newBalance = currentBalance;

      if (isReceiving) {
        // If receiving money, add to balance
        newBalance += amountNum;
      } else {
        // If sending money, subtract from balance
        newBalance -= amountNum;
      }

      setUpdatedBalance(newBalance);
    }
  }, [amount, type, currentBalance, isReceiving]);

  // Fetch user balance when email changes
  const handleEmailBlur = async (email: string) => {
    if (!email) return;

    try {
      const response = await axiosInstance.get(`/users/email/${email}`);
      setCurrentBalance(response.data.user.balance);
      setUpdatedBalance(response.data.user.balance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
      setCurrentBalance(null);
      setUpdatedBalance(null);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Determine if amount should be positive or negative based on isReceiving
      const adjustedAmount = !data.isReceiving
        ? Math.abs(parseFloat(data.amount)).toString()
        : (-Math.abs(parseFloat(data.amount))).toString();

      const response = await axiosInstance.post("/transactions", {
        email: data.email,
        description: data.description,
        amount: adjustedAmount,
        type: data.type,
        date: data.date,
        isReceiving: data.isReceiving,
      });

      toast("Transaction created successfully");
      router.push(`/users/${response.data.data.transaction.userId}`); // Redirect to user details page
    } catch (error) {
      console.error("Error creating transaction:", error);
      // toast({
      //   variant: "destructive",
      //   title: "Error",
      //   description: error.response?.data?.message || "Failed to create transaction",
      // });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Transaction</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              defaultValue={userEmail}
              {...register("email", {
                required: "User email is required",
                onBlur: (e) => handleEmailBlur(e.target.value),
              })}
              className="mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              {...register("date", { required: "Date is required" })}
              className="mt-2"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Transaction Direction Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isReceiving"
              checked={isReceiving}
              onCheckedChange={(checked) => {
                setValue("isReceiving", checked as boolean);
              }}
            />
            <Label htmlFor="isReceiving" className="font-medium cursor-pointer">
              Send Ammount
            </Label>
          </div>

          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              onValueChange={(value: TransactionFormData["type"]) =>
                setValue("type", value)
              }
              defaultValue="credit"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="ach">ACH Payment</SelectItem>
                <SelectItem value="wire">Wire Transfer</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
              className="mt-2"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Transaction description"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 5,
                  message: "Description must be at least 5 characters",
                },
              })}
              className="mt-2"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {currentBalance !== null && (
            <>
              <div>
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input
                  id="currentBalance"
                  value={currentBalance.toFixed(2)}
                  readOnly
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="updatedBalance">Updated Balance</Label>
                <Input
                  id="updatedBalance"
                  value={updatedBalance?.toFixed(2) || ""}
                  readOnly
                  className="mt-2"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Create Transaction"}
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

export default AddUserTransaction;
