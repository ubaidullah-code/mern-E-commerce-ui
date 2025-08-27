import axios from "axios";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-title";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from "@/components/ui/sheet";

import { addProductFormElements } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { Fragment, useEffect, useState } from "react";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  // State Management
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Data Fetching and Mutation Functions
  async function handleFetchAllProducts() {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/products/get"
      );
      if (data?.success) {
        setProductList(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddNewProduct() {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/admin/products/add",
        { ...formData, image: uploadedImageUrl },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data?.success) {
        toast({ title: "Product added successfully" });
        resetFormAndDialog();
        await handleFetchAllProducts();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditProduct() {
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/admin/products/edit/${currentEditedId}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (data?.success) {
        toast({ title: "Product updated successfully" });
        resetFormAndDialog();
        await handleFetchAllProducts();
      }
    } catch (error) {
      console.error("Error editing product:", error);
      toast({
        title: "Error",
        description: "Failed to edit product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteProduct(getCurrentProductId) {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/admin/products/delete/${getCurrentProductId}`
      );

      if (data?.success) {
        toast({ title: "Product deleted successfully" });
        await handleFetchAllProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Helper Functions
  function isFormValid() {
    return Object.keys(formData)
      .filter((key) => key !== "averageReview" && key !== "image")
      .every((key) => formData[key] !== "");
  }

  function resetFormAndDialog() {
    setOpenCreateProductsDialog(false);
    setFormData(initialFormData);
    setCurrentEditedId(null);
    setImageFile(null);
    setUploadedImageUrl("");
  }

  // Event Handlers
  function onSubmit(event) {
    event.preventDefault();
    if (currentEditedId !== null) {
      handleEditProduct();
    } else {
      handleAddNewProduct();
    }
  }

  // Lifecycle
  useEffect(() => {
    handleFetchAllProducts();
  }, []);

  useEffect(() => {
    if (currentEditedId) {
      const productToEdit = productList.find(item => item._id === currentEditedId);
      if (productToEdit) {
        setFormData(productToEdit);
        setUploadedImageUrl(productToEdit.image)
      }
    }
  }, [currentEditedId, productList]);


  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <p>Loading products...</p>
        ) : productList && productList.length > 0 ? (
          productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDeleteProduct}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={resetFormAndDialog}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid() || isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;