"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";


const PaymentVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();


  // const searchParams = useSearchParams();
  const cohortId = searchParams.get('cohort_id');
  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const courseId = searchParams.get("course_id");
      const tx_ref = searchParams.get("tx_ref");
      if (tx_ref) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_FLUTTERWAVE_VERIFY}/${tx_ref}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY}`,
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
              mode: 'no-cors',
              body: JSON.stringify({
                transaction_reference: reference,
                status: 1, 
                amount: (data.data.amount / 100),
                cohort_id: cohortId,
                course_id: courseId,
                payment_method: "FLUTTERWAVE",
                payment_gateway: "FLUTTERWAVE",
              }),
            });

            // Redirect user to the course page or show success message
            router.push(`/client-dashboard/my-payments/success?status=success`);
          } else {
            // console.error("Payment verification failed");
            router.push(`/client-dashboard/my-payments/failure?status=failed`);
          }
        } catch (error) {
          // console.error("Payment verification failed:", error);
          // router.push(`/course/${courseId}?status=failed`);
          router.push(`/client-dashboard/my-payments/failure?status=failed`);
        }
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return <p>Verifying payment...</p>;
};

export default PaymentVerification;
