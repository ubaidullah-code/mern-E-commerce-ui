import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog"; // Import DialogContent
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";


// Assuming AdminOrderDetailsView is imported correctly
import AdminOrderDetailsView from "./order_details";
import { useToast } from "@/hooks/use-toast";

function AdminOrdersView() {
  // State Management - No Redux needed
  const [orderList, setOrderList] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { toast } = useToast();

  // API Functions (formerly Redux thunks)
  async function handleFetchAllOrders() {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/orders/get");
      if (response.data?.success) {
        setOrderList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: "Failed to fetch orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFetchOrderDetails(id) {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/orders/details/${id}`);
      if (response.data?.success) {
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({ title: "Error", description: "Failed to fetch order details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStatus(id, orderStatus) {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/orders/update/${id}`, { orderStatus });
      if (response.data?.success) {
        toast({ title: "Success", description: "Order status updated." });
        await handleFetchAllOrders(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  }

  // Component Lifecycle
  useEffect(() => {
    handleFetchAllOrders();
  }, []);

  // Fetch details when an order is selected
  useEffect(() => {
    if (selectedOrderId) {
      handleFetchOrderDetails(selectedOrderId);
    }
  }, [selectedOrderId]);

  // Open the dialog once details are fetched
  useEffect(() => {
    if (orderDetails) {
      setOpenDetailsDialog(true);
    }
  }, [orderDetails]);

  // Event Handlers
  const handleDialogClose = () => {
    setOpenDetailsDialog(false);
    setOrderDetails(null);
    setSelectedOrderId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
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
            {isLoading && orderList.length === 0 ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center">Loading...</TableCell>
              </TableRow>
            ) : orderList && orderList.length > 0 ? (
              orderList.map((orderItem) => (
                <TableRow key={orderItem?._id}>
                  <TableCell>{orderItem?._id}</TableCell>
                  <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>${orderItem?.totalAmount}</TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedOrderId(orderItem?._id)}>
                      View Details
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

      {/* SINGLE DIALOG OUTSIDE THE MAP */}
      <Dialog open={openDetailsDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          {orderDetails && <AdminOrderDetailsView orderDetails={orderDetails} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default AdminOrdersView;