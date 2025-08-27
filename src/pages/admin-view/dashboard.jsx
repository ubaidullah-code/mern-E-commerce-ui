import { useState, useEffect } from "react";
import axios from "axios";
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import api from "@/config/api";

function AdminDashboard() {

  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [featureImageList, setFeatureImageList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch feature images from the API
  const fetchFeatureImages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/common/feature/get");
      if (response.data.success) {
        setFeatureImageList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching feature images:", error);
      setFeatureImageList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to upload a new feature image
  const handleUploadFeatureImage = async () => {
    if (!uploadedImageUrl) return;
    try {
      const response = await api.post("/api/common/feature/add", {
        image: uploadedImageUrl,
      });

      if (response.data.success) {
        // Reset state and refetch images to update the list
        setImageFile(null);
        setUploadedImageUrl("");
        fetchFeatureImages();
      }
    } catch (error) {
      console.error("Error uploading feature image:", error);
    }
  };
  const handleDelelteFeatureImage = async (imageId)=>{

      try {
          const response = await api.delete(`/api/common/feature/delete`, {data : {id : imageId}});  
          if(response.data.success) {
            // Refetch images to update the list after deletion
            fetchFeatureImages();
          }
      } catch (error) {
        console.log("Error deleting feature image:", error);
      }
  }

  // Fetch feature images when the component mounts
  useEffect(() => {
    fetchFeatureImages();
  }, []);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>

      <div className="flex flex-col gap-4 mt-5">
        {isLoading ? (
          <p>Loading images...</p>
        ) : featureImageList && featureImageList.length > 0 ? (
          featureImageList.map((featureImgItem) => (
            <div key={featureImgItem._id} className="relative">
              <img
                src={featureImgItem.image}
                className="w-full h-[300px] object-cover rounded-t-lg"
                alt="Feature"
              />
              <button
                onClick={()=>handleDelelteFeatureImage(featureImgItem._id)}
                aria-label="Close"
                className="absolute top-2 right-2 text-black  hover:animate-none p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p>No feature images found.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;