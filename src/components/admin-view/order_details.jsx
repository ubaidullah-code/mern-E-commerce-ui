import { useEffect, useState } from "react";
import axios from "axios";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";


const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails, onStatusUpdate }) {
  const [formData, setFormData] = useState(initialFormData);
  const { toast } = useToast();

  // Effect to set the form's initial state based on the current order's status
  useEffect(() => {
    if (orderDetails) {
      setFormData({
        status: orderDetails.orderStatus || "",
      });
    }
  }, [orderDetails]);

  // Async function to handle the API call for updating the status
  async function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/update/${orderDetails?._id}`,
        { orderStatus: status }
      );

      if (response.data?.success) {
        toast({
          title: response.data?.message || "Status updated successfully.",
        });
        // Notify the parent component to refresh its data
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Render a loading state if details are not yet available
  if (!orderDetails) {
    return (
      <DialogContent>
        <p>Loading order details...</p>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate?.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>${orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Items</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems?.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {item.title}{" "}
                    <span className="text-muted-foreground">x {item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              {/* Correctly displays the name from the order's shipping details */}
              <span>{orderDetails?.addressInfo?.name}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{`${orderDetails?.addressInfo?.city}, ${orderDetails?.addressInfo?.pincode}`}</span>
              <span>Phone: {orderDetails?.addressInfo?.phone}</span>
              {orderDetails?.addressInfo?.notes && (
                <span className="italic">Notes: {orderDetails?.addressInfo?.notes}</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Update Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;