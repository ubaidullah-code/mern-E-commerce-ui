import { use, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-title";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {
  Airplay, BabyIcon, ChevronLeftIcon, ChevronRightIcon, CloudLightning, Heater, Images,
  Shirt, ShirtIcon, ShoppingBasket, UmbrellaIcon, WashingMachine, WatchIcon,
} from "lucide-react";
import { GlobalContext } from "@/Context/Context";
import api from "@/config/api";


// Static Data (can be moved to a config file)
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];
const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];


// API Functions
async function getFeatureImagesAPI() {
  try {
    const response = await api.get("/api/common/feature/get");
    return response.data; // Corrected: Added return statement
  } catch (error) {
    console.error("Error fetching feature images:", error);
    // Return a default structure on error to prevent crashes
    return { success: false, data: [] };
  }
}

async function fetchAllFilteredProductsAPI(params) {
  const query = new URLSearchParams(params);
  const response = await api.get(`/api/shop/products/get?${query}`);
  return response.data;
}

async function fetchProductDetailsAPI(id) {
  const response = await api.get(`/api/shop/products/get/${id}`);
  return response.data;
}

async function addToCartAPI(cartData) {
  const response = await api.post("/api/shop/cart/add", cartData);
  return response.data;
}

  async function onCartUpdate(id) {

    try {
     await api.get(`/api/shop/cart/get/${id}`);
     
      
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      
    }
  }

// Main Component
function ShoppingHome() {
  // Global and Local State
  const { state } = useContext(GlobalContext);

  const [featureImageList, setFeatureImageList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [chart, setChart] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
async function onCartUpdate(id) {
  try {
    const res = await api.get(`/api/shop/cart/get/${id}`);
    if (res.data.success) {
      setChart(res.data.data); // ✅ Now it updates the chart state correctly
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
  }
}
  // Data Fetching Effect
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [featuresRes, productsRes] = await Promise.all([
          getFeatureImagesAPI(),
          fetchAllFilteredProductsAPI({ sortBy: "price-lowtohigh" })
        ]);
        if (featuresRes.success) setFeatureImageList(featuresRes.data);
        if (productsRes.success) setProductList(productsRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({ title: "Error", description: "Could not load page data.", variant: "destructive" });
      } finally {
        setIsLoadingFeatures(false);
        setIsLoadingProducts(false);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    onCartUpdate(state.user?.id);
  },[])
  // Image Slider Effect
  useEffect(() => {
    if (featureImageList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }, 5000); // 5 seconds interval
    return () => clearInterval(timer);
  }, [featureImageList]);

  // Open Details Dialog Effect
  useEffect(() => {
    if (productDetails !== null) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);


  // Event Handlers
  function handleNavigateToListingPage(item, section) {
    sessionStorage.removeItem("filters");
    const filters = { [section]: [item.id] };
    sessionStorage.setItem("filters", JSON.stringify(filters));
    navigate(`/shop/listing?${section}=${item.id}`);
  }

  async function handleGetProductDetails(productId) {
    try {
      const data = await fetchProductDetailsAPI(productId);
      if (data.success) {
        setProductDetails(data.data);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch product details.", variant: "destructive" });
    }
  }

  async function handleAddToCart(productId, totalStock , quantity = 1) {
  
    if (!state.user) {
        toast({ title: "Please log in", description: "You must be logged in to add items to the cart.", variant: "destructive" });
        return;
    }
    try {
      const data = await addToCartAPI({ userId: state.user.id, productId, quantity });
     
      if (data.success) {
        toast({ title: "Success", description: "Product added to cart." });
      setChart(data.data?.cart || []); // ✅ This now works without error
      await onCartUpdate(state.user.id);  // Notify parent to refresh cart data
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product to cart.", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Slider */}
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-gray-200">
        {isLoadingFeatures ? ( <div className="flex items-center justify-center h-full">Loading...</div> ) : (
            featureImageList.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt={`Banner ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        )}
        <Button
          variant="outline" size="icon"
          disabled={featureImageList.length === 0}
          onClick={() => setCurrentSlide((p) => (p - 1 + featureImageList.length) % featureImageList.length)}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        > <ChevronLeftIcon className="w-6 h-6" /> </Button>
        <Button
          variant="outline" size="icon"
          disabled={featureImageList.length === 0}
          onClick={() => setCurrentSlide((p) => (p + 1) % featureImageList.length)}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        > <ChevronRightIcon className="w-6 h-6" /> </Button>
      </div>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((category) => (
              <Card key={category.id} onClick={() => handleNavigateToListingPage(category, "category")}
                className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <category.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold text-lg">{category.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brand) => (
              <Card key={brand.id} onClick={() => handleNavigateToListingPage(brand, "brand")}
                className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brand.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold text-lg">{brand.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? ( <p>Loading products...</p> ) : productList.length > 0 ? (
              productList.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddToCart}
                />
              ))
            ) : ( <p>No products found.</p> )}
          </div>
        </div>
      </section>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
       cartItems={chart}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default ShoppingHome;