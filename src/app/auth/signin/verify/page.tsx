// pages/payment-success.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const tx_ref = searchParams.get("tx_ref");
      const status = searchParams.get("status");
      const access_token = searchParams.get("access_token");
      const user = searchParams.get("user");
      const role = searchParams.get("role");
      const client_id = searchParams.get("client_id");
      

      // if (!tx_ref || status !== "success") {
      //   setError("Invalid payment status or transaction reference.");
      //   return;
      // }

      try {
        // Fetch payment verification details to get the access_token
        // const response = await axios.get(
        //   `${process.env.NEXT_PUBLIC_API_URL}/verify-this-payment`,
        //   {
        //     params: { tx_ref, status },
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // const { access_token, user, role, client } = response.data;

        if (access_token && user) {
          // Store token and user details in localStorage (consistent with SignIn)
          localStorage.setItem("token", access_token);
          localStorage.setItem("client_id", client_id);
          localStorage.setItem("role", role);
          localStorage.setItem("status", status);

          // Redirect based on role and status
          if (role === "client" && status === "profile_created") {
            router.push("/clients/register");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError("Failed to retrieve authentication details.");
        }
      } catch (err) {
        console.error("Error verifying payment success:", err);
        setError("Failed to process payment success. Please try logging in.");
      }
    };

    handlePaymentSuccess();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {error ? (
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p>{error}</p>
          <a href="/auth/signin" className="text-white underline mt-2 block">
            Go to Sign In
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold">Processing payment...</p>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;