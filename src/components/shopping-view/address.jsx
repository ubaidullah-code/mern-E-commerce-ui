import { useContext, useEffect, useState } from "react";
import axios from "axios";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import AddressCard from "./address-card";
import { addressFormControls } from "@/config";
import api from "@/config/api";
import { GlobalContext } from "@/Context/context";
import { useDispatch } from "react-redux";
import { setAddress } from "@/store/addressSlice/Address-Slice";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({  setCurrentSelectedAddress, selectedId }) {
  // Local State Management
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const dispatchRedux = useDispatch()

  // API Functions
  const {state} =useContext(GlobalContext);
    const user = state.user;

  async function handleFetchAllAddresses() {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/api/shop/address/get/${user.id}`
      );
      if (data.success) {
        setAddressList(data.data);
       
        dispatchRedux(setAddress(data.data[0]))
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddNewAddress() {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/shop/address/add",
        { ...formData, userId: user.id }
      );
      if (data.success) {
        toast({ title: "Address added successfully" });
        setFormData(initialAddressFormData);
        await handleFetchAllAddresses();
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Error",
        description: "Failed to add address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditAddress() {
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/shop/address/update/${user.id}/${currentEditedId}`,
        formData
      );
      if (data.success) {
        toast({ title: "Address updated successfully" });
        setFormData(initialAddressFormData);
        setCurrentEditedId(null);
        await handleFetchAllAddresses();
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description: "Failed to update address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteAddress(addressId) {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/shop/address/delete/${user.id}/${addressId}`
      );
      if (data.success) {
        toast({ title: "Address deleted successfully" });
        await handleFetchAllAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Event Handlers
  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add a maximum of 3 addresses.",
        variant: "destructive",
      });
      return;
    }

    if (currentEditedId !== null) {
      handleEditAddress();
    } else {
      handleAddNewAddress();
    }
  }

  function handleDeleteAddressClick(addressId) {
    handleDeleteAddress(addressId);
  }

  function handleEditAddressClick(currentAddress) {
    setCurrentEditedId(currentAddress._id);
    setFormData({
      address: currentAddress.address,
      city: currentAddress.city,
      phone: currentAddress.phone,
      pincode: currentAddress.pincode,
      notes: currentAddress.notes || "", // Ensure notes is not undefined
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((key) => key !== "notes") // Notes can be optional
      .every((key) => formData[key].trim() !== "");
  }

  // Lifecycle
  useEffect(() => {
    handleFetchAllAddresses();
  }, [user]); // Re-fetch if user changes

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {isLoading ? (
          <p>Loading addresses...</p>
        ) : addressList && addressList.length > 0 ? (
          addressList.map((singleAddressItem) => (
            <AddressCard
              key={singleAddressItem._id}
              selectedId={selectedId}
              handleDeleteAddress={() => handleDeleteAddressClick(singleAddressItem._id)}
              addressInfo={singleAddressItem}
              handleEditAddress={() => handleEditAddressClick(singleAddressItem)}
              setCurrentSelectedAddress={setCurrentSelectedAddress}
            />
          ))
        ) : (
          <p>No addresses found. Please add a new address.</p>
        )}
      </div>
      <CardHeader>
        <CardTitle>
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Update" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid() || isLoading}
        />
      </CardContent>
    </Card>
  );
}

export default Address;