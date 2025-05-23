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
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

interface TransactionFormData {
  email: string;
  type:
    | "ach_credit"
    | "ach_employee_payment"
    | "ach_vendor_payment"
    | "deposit"
    | "incoming_wire_transfer"
    | "misc_credit"
    | "refund"
    | "zelle_credit"
    | "ach_debit"
    | "atm_transaction"
    | "bill_payment"
    | "card"
    | "loan_payment"
    | "misc_debit"
    | "outgoing_wire_transfer"
    | "overnight_check"
    | "tax_payment"
    | "egift_debit"
    | "zelle_debit"
    | "account_transfer"
    | "adjustment_or_reversal"
    | "returned_deposit_item"
    | "checks_under_2_years"
    | "checks_over_2_years";

  description: string;
  amount: string;
  date: string;
  isPending: boolean;
  balance: string;
}

// Helper function to determine if a transaction type is a credit (incoming)
const isCreditType = (type: string): boolean => {
  const creditTypes = [
    "ach_credit",
    "ach_employee_payment",
    "ach_vendor_payment",
    "deposit",
    "incoming_wire_transfer",
    "misc_credit",
    "refund",
    "zelle_credit",
  ];
  return creditTypes.includes(type);
};

const AddUserTransaction = () => {
  const router = useRouter();
  const userEmailURI = decodeURIComponent(useParams().id as string);

  const userEmail = userEmailURI == "undefined" ? "" : userEmailURI;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    defaultValues: {
      isPending: false,
      type: "deposit", // Set a default transaction type
    },
  });
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [updatedBalance, setUpdatedBalance] = useState<number | null>(null);

  // Watch amount, type and isPending changes to calculate updated balance
  const amount = watch("amount");
  const type = watch("type");
  const isPending = watch("isPending");

  // Calculate updated balance when amount, type or isPending changes
  React.useEffect(() => {
    if (currentBalance !== null && amount) {
      const amountNum = parseFloat(amount);
      let newBalance = currentBalance;

      // Only affect balance if transaction is not pending
      if (!isPending) {
        if (isCreditType(type)) {
          // Credit increases balance
          newBalance = currentBalance + amountNum;
        } else if (
          type !== "account_transfer" &&
          type !== "adjustment_or_reversal"
        ) {
          // Debit decreases balance (exclude neutral transactions)
          newBalance = currentBalance - amountNum;
        }
      }

      setUpdatedBalance(newBalance);
    }
  }, [amount, type, isPending, currentBalance]);

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
      // Create the transaction data
      const response = await axiosInstance.post("/transactions", {
        email: data.email,
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        isPending: data.isPending,
        balance: data.balance || undefined,
      });

      toast("Transaction created successfully");
      router.push(`/users/${response.data.data.transaction.userId}`);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast("Failed to create transaction");
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

          <div>
            <Label htmlFor="type" className="mb-2">
              Transaction Type
            </Label>
            <Select
              onValueChange={(value: TransactionFormData["type"]) =>
                setValue("type", value)
              }
              defaultValue="deposit"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ach_credit">ACH Credit</SelectItem>
                <SelectItem value="ach_employee_payment">
                  ACH Employee Payment
                </SelectItem>
                <SelectItem value="ach_vendor_payment">
                  ACH Vendor Payment
                </SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="incoming_wire_transfer">
                  Incoming Wire Transfer
                </SelectItem>
                <SelectItem value="misc_credit">Misc Credit</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="zelle_credit">Zelle Credit</SelectItem>

                <SelectItem value="ach_debit">ACH Debit</SelectItem>
                <SelectItem value="atm_transaction">ATM Transaction</SelectItem>
                <SelectItem value="bill_payment">Bill Payment</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="loan_payment">Loan Payment</SelectItem>
                <SelectItem value="misc_debit">Misc Debit</SelectItem>
                <SelectItem value="outgoing_wire_transfer">
                  Outgoing Wire Transfer
                </SelectItem>
                <SelectItem value="overnight_check">Overnight Check</SelectItem>
                <SelectItem value="tax_payment">Tax Payment</SelectItem>
                <SelectItem value="egift_debit">eGift Debit</SelectItem>
                <SelectItem value="zelle_debit">Zelle Debit</SelectItem>

                <SelectItem value="account_transfer">
                  Account Transfer
                </SelectItem>
                <SelectItem value="adjustment_or_reversal">
                  Adjustment or Reversal
                </SelectItem>
                <SelectItem value="returned_deposit_item">
                  Returned Deposit Item
                </SelectItem>
                <SelectItem value="checks_under_2_years">
                  Checks Under 2 Years
                </SelectItem>
                <SelectItem value="checks_over_2_years">
                  Checks Over 2 Years
                </SelectItem>
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

          {/* Add this inside your grid, perhaps after amount field */}
          <div>
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="Balance"
              {...register("balance", { required: "Balance is required" })}
              className="mt-2"
            />
            {errors.balance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.balance.message}
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

          {/* Transaction Pending Status Checkbox */}
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="isPending"
              checked={isPending}
              onCheckedChange={(checked) => {
                setValue("isPending", checked as boolean);
              }}
              {...register("isPending")}
            />
            <Label htmlFor="isPending" className="font-medium cursor-pointer">
              Mark as pending transaction
            </Label>
            <div className="text-sm text-gray-500 ml-2">
              (Pending transactions won't affect the balance)
            </div>
          </div>

          {currentBalance !== null && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
              <div>
                <Label htmlFor="currentBalance">Current Balance</Label>
                <Input
                  id="currentBalance"
                  value={`$${currentBalance.toFixed(2)}`}
                  readOnly
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="updatedBalance">
                  {isPending ? "Balance (Pending Ignored)" : "Updated Balance"}
                </Label>
                <Input
                  id="updatedBalance"
                  value={updatedBalance ? `$${updatedBalance.toFixed(2)}` : ""}
                  readOnly
                  className={`mt-2 ${
                    updatedBalance !== null && updatedBalance < 0
                      ? "text-red-500 font-medium"
                      : ""
                  }`}
                />
              </div>
            </div>
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
