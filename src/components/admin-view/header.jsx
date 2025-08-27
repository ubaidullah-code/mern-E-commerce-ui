import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useContext } from "react";
import { GlobalContext } from "@/Context/context";
import api from "@/config/api";
import { useToast } from "@/hooks/use-toast";


function AdminHeader({ setOpen }) {

      const { dispatch }= useContext(GlobalContext);
      const {toast}= useToast()
  const handleLogout = async ()=> {
  try {
    let res = await api.post('/api/v1/logout')
   
      dispatch({type : "USER_LOGOUT"})
      toast({ 
        title :res.data.message 
      })

  } catch (error) {
    dispatch({type : "USER_LOGOUT"})
    console.log("error", error)
  }


  }  

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
       <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;