"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, Send } from "lucide-react";

export default function UserDetailView() {
  const router = useRouter();
  const userId = useParams().id;

  // Mock data - in a real app, you would fetch this based on the userId
  const userData = {
    name: "Abdullah PRODUCTS LLC",
    account: "BUS COMPLETE CHK (...6032)",
    availableBalance: "$20,249.75",
    presentBalance: "$20,249.75",
    availableCredit: "$0.00",
    transactions: [
      {
        id: 1,
        date: "2025-04-20",
        description: "Payment to Vendor",
        amount: "-$1,250.00",
        balance: "$20,249.75",
      },
      {
        id: 2,
        date: "2025-04-18",
        description: "Customer Payment",
        amount: "+$3,500.00",
        balance: "$21,499.75",
      },
      {
        id: 3,
        date: "2025-04-15",
        description: "Utility Bill",
        amount: "-$345.25",
        balance: "$17,999.75",
      },
    ],
  };

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
          <CardTitle>{userData.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account</p>
              <p className="font-medium">{userData.account}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <p className="font-medium">{userId}</p>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell
                    className={`text-right ${
                      transaction.amount.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.balance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
