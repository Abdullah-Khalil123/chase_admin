// src/app/transactions/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { Checkbox } from "../ui/checkbox";

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

const debitTypes = [
  "ach_debit",
  "atm_transaction",
  "bill_payment",
  "card",
  "loan_payment",
  "misc_debit",
  "outgoing_wire_transfer",
  "overnight_check",
  "tax_payment",
  "egift_debit",
  "zelle_debit",
];

const otherTypes = [
  "account_transfer",
  "adjustment_or_reversal",
  "returned_deposit_item",
  "checks_under_2_years",
  "checks_over_2_years",
];

const allTransactionTypes = [
  ...creditTypes,
  ...debitTypes,
  ...otherTypes,
] as const;

// Define the transaction schema
// Update the transaction schema
const transactionSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  updatedBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Balance must be a number",
  }),
  type: z.enum(allTransactionTypes as [string, ...string[]]),
  date: z.date(),
  isPending: z.boolean(),
});
type TransactionFormValues = z.infer<typeof transactionSchema>;

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  date: string;
  updatedBalance: number;
  userId: string;
  isPending: boolean;
};

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "debit",
      date: new Date(),
      isPending: false,
    },
  });

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsFetching(true);
        const response = await axiosInstance.get(
          `/transactions/getTransactionById/${transactionId}`
        );
        console.log("Transaction response:", response.data);
        if (response.data.status === "success") {
          const transactionData = response.data.data.transaction;
          setTransaction(transactionData);

          // Set form values
          form.reset({
            description: transactionData.description,
            amount: transactionData.amount.toString(),
            updatedBalance: transactionData.updatedBalance.toString(),
            type: transactionData.type,
            date: new Date(transactionData.date),
            isPending: transactionData.isPending || false,
          });
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast("Failed to fetch transaction details.");
      } finally {
        setIsFetching(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, form]);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.patch(
        `/transactions/${transactionId}`,
        {
          description: data.description,
          amount: data.amount,
          updatedBalance: data.updatedBalance,
          type: data.type,
          date: data.date.toISOString(),
          isPending: data.isPending,
        }
      );

      if (response.data.status === "success") {
        toast("The transaction was successfully updated.");
        router.back();
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast("Failed to update transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading transaction...</span>
      </div>
    );
  }

  if (!transaction && !isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
            <CardDescription>
              The transaction you are looking for does not exist or has been
              deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/transactions")}
              className="w-full"
            >
              Back to Transactions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
          <CardDescription>
            Update the details of your transaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="updatedBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                defaultValue={transaction?.type}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
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
                        <SelectItem value="zelle_credit">
                          Zelle Credit
                        </SelectItem>

                        <SelectItem value="ach_debit">ACH Debit</SelectItem>
                        <SelectItem value="atm_transaction">
                          ATM Transaction
                        </SelectItem>
                        <SelectItem value="bill_payment">
                          Bill Payment
                        </SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="loan_payment">
                          Loan Payment
                        </SelectItem>
                        <SelectItem value="misc_debit">Misc Debit</SelectItem>
                        <SelectItem value="outgoing_wire_transfer">
                          Outgoing Wire Transfer
                        </SelectItem>
                        <SelectItem value="overnight_check">
                          Overnight Check
                        </SelectItem>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Transaction description"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPending"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pending Transaction</FormLabel>
                      <FormDescription>
                        Mark this transaction as pending if it has not been
                        fully processed.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/users/manage")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
