import { useState, useEffect, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { GlobalContext } from "@/Context/context";
import api from "@/config/api";
import { useLocation } from "react-router-dom";
import { Minus, Plus, Trash } from "lucide-react";
import { useSelector } from "react-redux";

// --- API Helper Functions ---
async function updateCartQuantityAPI({ userId, productId, quantity }) {
  const { data } = await api.put("/api/shop/cart/update-cart", {
    userId,
    productId,
    quantity,
  });
  return data;
}

async function deleteCartItemAPI({ userId, productId }) {
  const { data } = await api.delete(`/api/shop/cart/${userId}/${productId}`);
  return data;
}

// --- Combined Component ---
function ShoppingCheckout() {
  const addressState = useSelector(state => state.address)
  const { state } = useContext(GlobalContext);
  const user = state.user;
  const location = useLocation();
  const { toast } = useToast();

  // --- State Management ---
  const [cart, setCart] = useState(null);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(addressState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For cart item actions

  // --- Effects ---
  useEffect(() => {
    if (addressState && addressState._id) {
      setCurrentSelectedAddress(addressState);
    }
  }, [addressState]);
  const fetchCart = useCallback(async () => {
    if (!user?.id) return; // Exit if no user id

    setIsLoading(true);
    try {
      const res = await api.get(`/api/shop/cart/get/${user.id}`);
      if (res.data.success && res.data.data) {
        // Assuming the API returns a 'data' object which contains the cart
        setCart(res.data.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Could not fetch your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    // If cart data is passed via location state, use it initially.
    const initialCart = location.state?.cartItems?.[0] || null;
    if (initialCart) {
        setCart(initialCart)
    }
    // Then fetch the latest cart data.
    fetchCart();
  }, [fetchCart, location.state]);

  // --- Calculations ---
  const totalCartAmount =
    cart?.items?.reduce(
      (sum, currentItem) =>
        sum +
        (currentItem.salePrice > 0
          ? currentItem.salePrice
          : currentItem.price) *
          currentItem.quantity,
      0
    ) || 0;

  // --- Event Handlers for Cart Items ---

  const handleUpdateQuantity = useCallback(
    async (productId, currentQuantity, typeOfAction) => {
      const newQuantity =
        typeOfAction === "plus" ? currentQuantity + 1 : currentQuantity - 1;

      // Placeholder for product stock. You should fetch this data for each product.
      const productStock = 10;
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
          productId: productId,
          quantity: newQuantity,
        });

        if (data?.success) {
          toast({ title: "Cart item updated successfully" });
          fetchCart(); // Refetch cart to reflect changes
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
    },
    [user?.id, toast, fetchCart]
  );

  const handleCartItemDelete = useCallback(
    async (productId) => {
      setIsLoading(true);
      try {
        const data = await deleteCartItemAPI({
          userId: user?.id,
          productId: productId,
        });

        if (data?.success) {
          toast({ title: "Cart item deleted successfully" });
          fetchCart(); // Refetch cart to reflect changes
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
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, toast, fetchCart]
  );

  // --- Event Handler for Checkout ---

  async function handleCheckout() {
    if (!cart?.items || cart.items.length === 0) {
      toast({
        title: "Your cart is empty.",
        description: "Please add items to your cart before proceeding.",
        variant: "destructive",
      });
      return;
    }
    

    if (!currentSelectedAddress) {
      toast({
        title: "No address selected.",
        description: "Please select a shipping address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
  
    const orderData = {
      userId: user?.id,
      cartId: cart?._id,
      cartItems: cart.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
      })),
        addressInfo: {
        addressId: currentSelectedAddress._id,
        address: currentSelectedAddress.address,
        city: currentSelectedAddress.city,
        pincode: currentSelectedAddress.pincode,
        phone: currentSelectedAddress.phone,
        notes: currentSelectedAddress.notes,
      },
      totalAmount: totalCartAmount,
    };

   
    
    // Simulate processing time


    try {
      const resOrder = await api.post('/api/shop/order/create', orderData )

       toast({
            title: "Checkout Complete",
            description: `${resOrder.data.message}`,
        })
        setIsProcessing(false);

    } catch (error) {
      console.log("error ", error)
    }

  }

  // --- Render Method ---
  return (
    <div className="flex flex-col">
      {/* Header Image */}
      <div className="relative h-[250px] md:h-[300px] w-full overflow-hidden">
        <img
          src={img}
          alt="Checkout banner"
          className="h-full w-full object-cover object-center"
        />
      </div>
      {/* Main Content */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 p-4">
        {/* Address Section */}
        <Address
          selectedId={currentSelectedAddress?._id}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        {/* Cart and Checkout Section */}
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-6 h-fit">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {isLoading && !cart ? (
             <p className="text-center text-gray-500">Loading cart...</p>
          ) : cart?.items && cart.items.length > 0 ? (
            cart.items.map((item) => {
              const itemPrice =
                item.salePrice > 0 ? item.salePrice : item.price;
              const itemTotalPrice = (itemPrice * item.quantity).toFixed(2);
              const productStock = 10; // Placeholder for product stock

              return (
                <div
                  key={item.productId}
                  className="flex items-center space-x-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-extrabold">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        size="icon"
                        disabled={isLoading || item.quantity <= 1}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity,
                            "minus"
                          )
                        }
                      >
                        <Minus className="w-4 h-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <span className="font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        size="icon"
                        disabled={isLoading || item.quantity >= productStock}
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity,
                            "plus"
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-semibold">${itemTotalPrice}</p>
                    <button
                      disabled={isLoading}
                      onClick={() => handleCartItemDelete(item.productId)}
                    >
                      <Trash
                        className={`cursor-pointer mt-1 ${
                          isLoading ? "text-gray-400" : "text-red-500"
                        }`}
                        size={20}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          )}
          <div className="mt-8 space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl">
                ${totalCartAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button
              onClick={handleCheckout}
              disabled={isProcessing || isLoading}
              className="w-full h-12 text-lg"
            >
              {isProcessing
                ? "Processing..."
                : "Proceed to Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;