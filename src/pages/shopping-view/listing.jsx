import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { sortOptions } from "@/config";
import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-title";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { useToast } from "@/hooks/use-toast";
import { GlobalContext } from "@/Context/context";


// API Functions
async function fetchAllFilteredProductsAPI(params) {
  const query = new URLSearchParams(params);
  const response = await axios.get(`http://localhost:5000/api/shop/products/get?${query}`);
  return response.data;
}

async function fetchProductDetailsAPI(id) {
  const response = await axios.get(`http://localhost:5000/api/shop/products/get/${id}`);
  return response.data;
}

async function addToCartAPI(cartData) {
  try {
    const response = await axios.post("http://localhost:5000/api/shop/cart/add", cartData);
    return response.data;
    
  } catch (error) {
    console.log("eroor", error)
  }
}

// Utility Function
function createSearchParamsHelper(filterParams) {
    const params = new URLSearchParams();
    for (const key in filterParams) {
        if (Array.isArray(filterParams[key]) && filterParams[key].length > 0) {
            params.set(key, filterParams[key].join(','));
        }
    }
    return params.toString();
}


// Main Component
function ShoppingListing({ user, cartItems = [], onCartUpdate }) {
  // Local State
    const { state } = useContext(GlobalContext);
  const [productList, setProductList] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Initialize filters from session storage or URL on mount
  useEffect(() => {
    const sessionFilters = JSON.parse(sessionStorage.getItem("filters"));
    if (sessionFilters && Object.keys(sessionFilters).length > 0) {
      setFilters(sessionFilters);
    } else {
        // Fallback to URL params if session is empty
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value.split(',');
        }
        setFilters(params);
    }
  }, []);

  // Fetch products when filters or sort change
  useEffect(() => {
    async function handleFetchAllProducts() {
      setIsLoadingProducts(true);
      try {
        const params = { ...filters, sortBy: sort };
        const data = await fetchAllFilteredProductsAPI(params);
        if (data.success) {
          setProductList(data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
      } finally {
        setIsLoadingProducts(false);
      }
    }
    handleFetchAllProducts();
  }, [filters, sort]);

  // Update URL when filters change
  useEffect(() => {
    const queryString = createSearchParamsHelper(filters);
    setSearchParams(queryString);
  }, [filters, setSearchParams]);

  // Open product details dialog
  useEffect(() => {
    if (productDetails) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);


  // Event Handlers
  function handleFilter(sectionId, option) {
    const newFilters = { ...filters };
    if (!newFilters[sectionId]) {
      newFilters[sectionId] = [];
    }
    const optionIndex = newFilters[sectionId].indexOf(option);
    if (optionIndex > -1) {
      newFilters[sectionId].splice(optionIndex, 1);
      // If the array becomes empty, remove the key
      if (newFilters[sectionId].length === 0) {
        delete newFilters[sectionId];
      }
    } else {
      newFilters[sectionId].push(option);
    }
    setFilters(newFilters);
    sessionStorage.setItem("filters", JSON.stringify(newFilters));
  }

  async function handleGetProductDetails(productId) {
    try {
      const data = await fetchProductDetailsAPI(productId);
      if (data.success) setProductDetails(data.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch details.", variant: "destructive" });
    }
  }

  async function handleAddToCart(productId, totalStock) {
    if (!state.user) {
        toast({ title: "Please log in", description: "You must be logged in to add items.", variant: "destructive" });
        return;
    }
    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem && existingItem.quantity >= totalStock) {
        toast({ title: "Stock limit reached", variant: "destructive" });
        return;
    }
    try {
        const data = await addToCartAPI({ userId: user.id, productId, quantity: 1 });
        if (data.success) {
            toast({ title: "Success", description: "Product added to cart." });
            onCartUpdate();
        } else {
            toast({ title: "Error", description: data.message, variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "Failed to add product to cart.", variant: "destructive" });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 p-4 md:p-6">
      <ProductFilter filters={filters} handleFilter={handleFilter} />
      <div className="bg-background w-full rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Products</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              {productList?.length || 0} Products
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                  {sortOptions.map((item) => (
                    <DropdownMenuRadioItem value={item.id} key={item.id}>
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {isLoadingProducts ? (
            <p>Loading products...</p>
          ) : productList && productList.length > 0 ? (
            productList.map((product) => (
              <ShoppingProductTile
                key={product._id}
                product={product}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="col-span-full text-center py-10">No products found matching your criteria.</p>
          )}
        </div>
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
        user={user}
        cartItems={cartItems}
        onAddToCart={() => handleAddToCart(productDetails._id, productDetails.totalStock)}
      />
    </div>
  );
}

export default ShoppingListing;