import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Label } from "../ui/label";
import UserCartWrapper from "./cart-wrapper"; // Assuming this component is self-contained or also refactored
import { useContext, useEffect, useState } from "react";
import { shoppingViewHeaderMenuItems } from "@/config"; // Assuming this config is needed
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { GlobalContext } from "@/Context/context";
import api from "@/config/api";


// Main Self-Contained Header Component
function ShoppingHeader() {
  const {state , dispatch } = useContext(GlobalContext);
 
  const user = state.user;
  const isAuthenticated = state.isLogin;
  const [cart, setCart] = useState(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // API Functions
  async function handleFetchCartItems() {
    if (!user?.id) return;
    setIsLoadingCart(true);
    try {
      const  res  = await api.get(`/api/shop/cart/get/${user.id}`);
     
      if (res.data.success) {
        setCart(res.data?.data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoadingCart(false);
    }
  }

 const handleLogout = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post('/api/v1/logout');
    dispatch({ type: "USER_LOGOUT" });
    toast({ title: res.data.message || "Logged out successfully" });
    navigate("/shop"); // Redirect after logout
  } catch (error) {
    console.error("Logout error:", error);
    toast({ title: "Logout failed", description: error.message, variant: "destructive" });
  }
};


  // Effect to fetch cart on user change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      handleFetchCartItems();
    } else {
      setCart(null); // Clear cart if user logs out
    }
  }, [isAuthenticated, user.id]);
  
  // Internal component for menu items to avoid repetition
  const MenuItems = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    function handleNavigate(menuItem) {
      setOpenMobileMenu(false); // Close mobile menu on navigation
      sessionStorage.removeItem("filters");
      const isCategory = menuItem.id !== "home" && menuItem.id !== "products";
      const filters = isCategory ? { category: [menuItem.id] } : null;
      sessionStorage.setItem("filters", JSON.stringify(filters));

      if (location.pathname.includes("/shop/listing") && isCategory) {
        setSearchParams(new URLSearchParams(`?category=${menuItem.id}`));
      } else {
        navigate(menuItem.path);
      }
    }

    return (
      <nav className="flex flex-col lg:flex-row lg:items-center gap-6 mt-4 lg:mt-0">
        {shoppingViewHeaderMenuItems.map((item) => (
          <Label
            key={item.id}
            onClick={() => handleNavigate(item)}
            className="text-lg lg:text-sm font-medium cursor-pointer hover:text-gray-700"
          >
            {item.label}
          </Label>
        ))}
      </nav>
    );
  };
  
  // Internal component for right-side content
  const HeaderRightContent = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="flex flex-col items-start lg:flex-row lg:items-center gap-4 mt-6 lg:mt-0">
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <Button onClick={() => setOpenCartSheet(true)} variant="outline" size="icon" className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-[-5px] right-[2px] font-bold text-sm bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
              {cart?.items?.length || 0}
            </span>
          <span className="sr-only">User cart</span>
          </Button>
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={cart?.items}
            onCartUpdate={handleFetchCartItems} // Pass callback to refresh cart
          />
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black cursor-pointer">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56">
            <DropdownMenuLabel>Hi, {user?.username}!</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/shop/account")}>
              <UserCog className="mr-2 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
       
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold text-lg">E-Shop</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <MenuItems />
        </div>

        {/* Desktop Right Content */}
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle header menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs p-6">
                <MenuItems />
                <Separator className="my-6"/>
                <HeaderRightContent />
            </SheetContent>
          </Sheet>
        </div>
   
      </div>
    </header>
  );
}

export default ShoppingHeader;