import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useContext, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/config/api";
import { GlobalContext } from "@/Context/context";

// API helpers
async function updateCartQuantityAPI({ userId, productId, quantity }) {
  const { data } = await api.put("/api/shop/cart/update-cart", { userId, productId, quantity });
  return data;
}

async function deleteCartItemAPI({ userId, productId }) {
  const { data } = await api.delete(`/api/shop/cart/${userId}/${productId}`);
  return data;
}

function getItemPrice(item) {
  return item ? (item.salePrice > 0 ? item.salePrice : item.price) : 0;
}

function UserCartItemsContent({ cartItem, productStock }) {
  const { state } = useContext(GlobalContext);
  const user = state.user;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateQuantity = useCallback(async (typeOfAction) => {
    const newQuantity = typeOfAction === "plus"
      ? cartItem.quantity + 1
      : cartItem.quantity - 1;

    if (newQuantity > productStock) {
      toast({
        title: `Only ${productStock} units are available.`,
        variant: "destructive",
      });
      return;
    }

    if (newQuantity < 1) return;

    setIsLoading(true);
    try {
      const data = await updateCartQuantityAPI({
        userId: user?.id,
        productId: cartItem.productId,
        quantity: newQuantity,
      });

      if (data?.success) {
        toast({ title: "Cart item updated successfully" });
        // Optionally: refetch cart in parent component
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update cart item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [cartItem, user, toast, productStock]);

  const handleCartItemDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await deleteCartItemAPI({
        userId: user?.id,
        productId: cartItem.productId,
      });

      if (data?.success) {
        toast({ title: "Cart item deleted successfully" });
        // Optionally: refetch cart in parent component
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete cart item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast({
        title: "Error",
        description: "Failed to delete cart item.",
        variant: "destructive",
      });
    }
  }, [cartItem, user, toast]);

  if (!cartItem) return null;

  const itemTotalPrice = (getItemPrice(cartItem) * cartItem.quantity).toFixed(2);

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem.image}
        alt={cartItem.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={isLoading || cartItem.quantity <= 1}
            onClick={() => handleUpdateQuantity("minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={isLoading || cartItem.quantity >= productStock}
            onClick={() => handleUpdateQuantity("plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">${itemTotalPrice}</p>
        <button disabled={isLoading} onClick={handleCartItemDelete}>
          <Trash
            className={`cursor-pointer mt-1 ${isLoading ? "text-gray-400" : "text-red-500"}`}
            size={20}
          />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
