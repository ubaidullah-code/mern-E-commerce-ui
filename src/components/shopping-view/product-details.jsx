import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import StarRatingComponent from "../common/star-rating";
import { GlobalContext } from "@/Context/context";
import api from "@/config/api";


// API Functions
async function getReviewsAPI(productId) {

  // const response = await api.get(`/api/shop/review/get/${productId}`);
  const response = await api.get(`/api/shop/review/${productId}`);
  
  return response.data;
}

async function addReviewAPI(reviewData) {

  
  const response = await api.post("/api/shop/review/add", reviewData);

  
  return response.data;
}


function ProductDetailsDialog({
  open,
  setOpen,
  productDetails,
  
  cartItems = [],
  onAddToCart,
}) {
  // Local State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();
  const {state} = useContext(GlobalContext);
  const user = state.user;

  // Fetch reviews when product changes
  useEffect(() => {
    async function handleFetchReviews() {
      if (!productDetails?._id) return;
      setIsLoadingReviews(true);
      try {
        const data = await getReviewsAPI(productDetails._id);
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    handleFetchReviews();
  }, [productDetails]);

  // Event Handlers
  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCartClick() {
    if (!productDetails) return;

    const currentCartItem = cartItems.find(
      (item) => item.productId === productDetails._id
    );
    const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0;

    if (currentQuantityInCart + 1 > productDetails.totalStock) {
      toast({
        title: `Only ${productDetails.totalStock} units are available.`,
        variant: "destructive",
      });
      return;
    }
    // Delegate cart addition to the parent component
    onAddToCart(productDetails._id, 1);
  }

  async function handleAddReview() {
  
    if (!user || !productDetails) return;
    setIsSubmittingReview(true);
    try {
      const data = await addReviewAPI({
        productId: productDetails._id,
        userId: user.id,
        userName: user.username,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      });
     
      if (data.success) {
        toast({ title: "Review added successfully!" });
        setReviewMsg("");
        setRating(0);
        // Refresh reviews
        const updatedReviews = await getReviewsAPI(productDetails._id);
        if (updatedReviews.success) {
          setReviews(updatedReviews.data);
        }
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast({ title: "Error", description: "Failed to add review.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  }

  function handleDialogClose() {
    setOpen(false);
    // Reset local state on close
    setReviewMsg("");
    setRating(0);
    setReviews([]);
  }

  const averageReview =
    reviews.length > 0
      ? reviews.reduce((sum, item) => sum + item.reviewValue, 0) / reviews.length
      : 0;

  if (!productDetails) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-12 max-w-[90vw] sm:max-w-4xl">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails.image}
            alt={productDetails.title}
            className="aspect-square w-full object-cover"
          />
        </div>
        {/* Product Info */}
        <div className="flex flex-col">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails.title}</h1>
            <p className="text-muted-foreground text-lg my-4">
              {productDetails.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails.salePrice > 0 ? "line-through text-gray-500" : ""
              }`}
            >
              ${productDetails.price.toFixed(2)}
            </p>
            {productDetails.salePrice > 0 && (
              <p className="text-3xl font-bold text-red-600">
                ${productDetails.salePrice.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">({averageReview.toFixed(1)})</span>
          </div>
          <div className="my-5">
            {productDetails.totalStock === 0 ? (
              <Button disabled className="w-full">Out of Stock</Button>
            ) : (
              <Button className="w-full" onClick={handleAddToCartClick}>
                Add to Cart
              </Button>
            )}
          </div>
          <Separator />
          {/* Reviews Section */}
          <div className="flex-grow overflow-y-auto mt-4 pr-2">
            <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
            <div className="grid gap-6">
              {isLoadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>{review.userName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                      <h3 className="font-bold">{review.userName}</h3>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={review.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">{review.reviewMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to write one!</p>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Label className="font-bold text-lg">Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(e) => setReviewMsg(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={isSubmittingReview}
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === "" || rating === 0 || isSubmittingReview}
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;