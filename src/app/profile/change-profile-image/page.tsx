"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Correct import for useRouter

const Profile = () => {
  const [formData, setFormData] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [surName, setSurName] = useState("");
  const [role, setRole] = useState("");
  const [client_id, setClientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter(); // Correct usage of useRouter

  useEffect(() => {
    const fetchClientId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client-id`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setFirstName(data.firstname);
          setOtherNames(data.othernames);
          setSurName(data.surname);
          setClientId(data.client_id);
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };
    fetchClientId();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/get-role`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setRole(data.role);
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  const handleFileChange = (e) => {
    setFormData(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    const token = localStorage.getItem("token");

    const imageData = new FormData();
    imageData.append("image", formData);
    imageData.append("client_id", client_id);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-profile-image`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setSuccess("Image uploaded successfully!");
      setFormData(null);
      setUploadProgress(0);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setError("There was a problem uploading your image. Please try again.");
    } finally {
      setIsSubmitting(false);
      if (success) {
        window.location.reload(); // Force a reload of the page
    }
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile Image" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {firstName} {otherNames} {surName}
              </h3>
              <p className="font-medium">CLIENT ID: {client_id}</p>

              <p className="mt-4.5" style={{ color: "blue", fontSize: "16pt" }}>
                Change Profile Image
              </p>

              <div className="mx-auto max-w-180">
                <label
                  htmlFor="upload_image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                {uploadProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                <br />
              </div>
              <br />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                {isSubmitting ? "Uploading..." : "Upload Image"}
              </button>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
