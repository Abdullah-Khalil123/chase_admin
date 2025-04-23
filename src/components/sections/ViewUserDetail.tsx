"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Send } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  updatedBalance: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username: string;
  address?: string;
  account: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  availableCredit?: number;
  availableBalance: string;
  presentBalance: string;
}

export default function UserDetailView() {
  const router = useRouter();
  const { id: userId } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format transaction date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  // Format transaction amount with sign
  const formatAmount = (amount: number, type: string): string => {
    const isPositive = [
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
    ].includes(type.toLowerCase());
    return `${isPositive ? "-" : "+"}${formatCurrency(Math.abs(amount))}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`users/${userId}`);

        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = response.data;

        if (result.status === "success") {
          setUserData({
            ...result.data.user,
            availableBalance: formatCurrency(result.data.user.balance),
            presentBalance: formatCurrency(result.data.user.balance),
            availableCredit: formatCurrency(
              result.data.user.availableCredit || 0
            ),
            account: `${
              result.data.user.accountType
            } (${result.data.user.accountNumber
              .slice(-4)
              .padStart(result.data.user.accountNumber.length, "*")})`,
          });
        } else {
          throw new Error(result.message || "Failed to fetch user data");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await axiosInstance.get(`/transactions/${userId}`, {
        params: { page: currentPage, limit: 10 },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = response.data;
      console.log("Transaction data:", result);

      if (result.status === "success") {
        setTransactions(result.data.transactions);
        setTotalPages(result.totalPages);
      } else {
        throw new Error(result.message || "Failed to fetch transactions");
      }
    } catch (err: unknown) {
      setTransactionsError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, currentPage]);

  const handleDeleteTransaction = async (transactionId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this transaction? This action cannot be undone."
      )
    ) {
      try {
        const response = await axiosInstance.delete(
          `/transactions/${transactionId}`
        );

        if (response.status === 204) {
          toast("Transaction deleted");

          // Refresh user data to get updated balance
          const userResponse = await axiosInstance.get(`users/${userId}`);
          if (userResponse.data.status === "success") {
            setUserData({
              ...userResponse.data.data.user,
              availableBalance: formatCurrency(
                userResponse.data.data.user.balance
              ),
              presentBalance: formatCurrency(
                userResponse.data.data.user.balance
              ),
              availableCredit: formatCurrency(
                userResponse.data.data.user.availableCredit || 0
              ),
              account: `${
                userResponse.data.data.user.accountType
              } (${userResponse.data.data.user.accountNumber
                .slice(-4)
                .padStart(
                  userResponse.data.data.user.accountNumber.length,
                  "*"
                )})`,
            });

            fetchTransactions();
          }

          // Refresh transactions
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast("Failed to delete transaction. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Error</h2>
        </div>
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p>Failed to load user data: {error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">User Not Found</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p>The requested user could not be found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">User Details</h2>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-slate-50">
          <CardTitle>{userData.username}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account</p>
              <p className="font-medium">{userData.account}</p>
            </div>
            {/* <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <p className="font-medium">{userData.id}</p>
            </div> */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Available Balance
              </p>
              <p className="font-medium text-lg text-green-600">
                {userData.availableBalance}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Present Balance
              </p>
              <p className="font-medium">{userData.presentBalance}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Available Credit
              </p>
              <p className="font-medium">{userData.availableCredit}</p>
            </div>
            {/* <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div> */}
            {/* {userData.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
            )} */}
            {userData.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium">{userData.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        {/* <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList> */}

        <TabsContent value="transactions">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  router.push("/transactions/add/" + userData.email)
                }
              >
                <Send className="h-4 w-4 mr-2" />
                Add Txn
              </Button>
            </div>
          </div>

          {transactionsLoading ? (
            <div className="p-6 text-center">Loading transactions...</div>
          ) : transactionsError ? (
            <div className="p-6 text-center text-red-600">
              Error loading transactions: {transactionsError}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions found for this user.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        {transaction.description || "No description"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.type
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          [
                            "ach_credit",
                            "ach_employee_payment",
                            "ach_vendor_payment",
                            "deposit",
                            "incoming_wire_transfer",
                            "misc_credit",
                            "refund",
                            "zelle_credit",
                          ].includes(transaction.type.toLowerCase())
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.updatedBalance)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          Delete
                        </Button>
                        <Link href={`/transactions/edit/${transaction.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                          >
                            Update
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="statements">
          <div className="bg-slate-50 p-8 rounded-md text-center">
            <h3 className="text-lg font-medium mb-2">Statements</h3>
            <p className="text-muted-foreground mb-4">
              View and download account statements
            </p>
            <Button>View Statements</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-slate-50 p-8 rounded-md text-center">
            <h3 className="text-lg font-medium mb-2">Account Settings</h3>
            <p className="text-muted-foreground mb-4">
              Manage account settings and preferences
            </p>
            <Button>Manage Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
