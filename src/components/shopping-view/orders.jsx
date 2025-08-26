import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useToast } from "@/hooks/use-toast";
import ShoppingOrderDetailsView from "./order-details";
import { Badge } from "../ui/badge";
import { GlobalContext } from "@/Context/context";


function ShoppingOrders() {
  // Local State Management
  const [orderList, setOrderList] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { toast } = useToast();
    const { state } = useContext(GlobalContext);
    const user = state.user;

  // API Functions
  async function handleFetchAllOrders() {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/shop/order/list/${user.id}`
      );
      if (data.success) {
        setOrderList(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFetchOrderDetails(orderId) {
    setIsDetailsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/shop/order/details/${orderId}`
      );
      if (data.success) {
        setOrderDetails(data.data);
      } else {
         toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details.",
        variant: "destructive",
      });
    } finally {
      setIsDetailsLoading(false);
    }
  }

  // Lifecycle Hook
  useEffect(() => {
    handleFetchAllOrders();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center">Loading orders...</TableCell>
              </TableRow>
            ) : orderList && orderList.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell className="font-medium">{orderItem._id}</TableCell>
                  <TableCell>{new Date(orderItem.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 text-white ${
                        orderItem.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-gray-800"
                      }`}
                    >
                      {orderItem.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>${orderItem.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      disabled={isDetailsLoading && orderDetails?._id === orderItem._id}
                      onClick={() => handleFetchOrderDetails(orderItem._id)}
                    >
                      {isDetailsLoading && orderDetails?._id === orderItem._id ? "Loading..." : "View Details"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Single Dialog for Order Details */}
      <Dialog
        open={orderDetails !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOrderDetails(null);
          }
        }}
      >
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </Card>
  );
}

export default ShoppingOrders;