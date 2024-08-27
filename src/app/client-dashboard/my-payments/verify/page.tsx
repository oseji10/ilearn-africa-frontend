"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const PaymentVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const courseId = searchParams.get("course_id");

      if (reference) {
        try {
          const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to verify payment");
          }

          const data = await response.json();
          if (data.status && data.data.status === "success") {
            // console.log("Payment verified successfully");

            // Send the verification result to your backend for further processing
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-payment`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              mode: 'cors',
              body: JSON.stringify({
                transaction_reference: reference,
                status: 1, // Store 1 in the database for a successful payment
                amount: `${data.data.amount}`,
                course_id: courseId,
                payment_method: "PAYSTACK",
                payment_gateway: "PAYSTACK",
              }),
            });

            // Redirect user to the course page or show success message
            router.push(`/payments/success?status=success`);
          } else {
            console.error("Payment verification failed");
            router.push(`/payments/failure?status=failed`);
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
          router.push(`/course/${courseId}?status=failed`);
        }
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return <p>Verifying payment...</p>;
};

export default PaymentVerification;
