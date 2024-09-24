import { useEffect } from "react";
import { useRouter } from "next/router";

const CheckUserRole = () => {
  const router = useRouter();

  useEffect(() => {
    // Fetch items from local storage
    const role = localStorage.getItem("role");
    const client = localStorage.getItem("client"); // Assume this is a JSON object as a string

    // Parse client if it exists
    let clientData = null;
    if (client) {
      clientData = JSON.parse(client);
    }

    // Check if role and client data are available in local storage
    if (role && clientData) {
      // Check if the user role is 'client' and the client status is 'profile_created'
      if (role === "client" && clientData.status === "profile_created") {
        router.push("/clients/register"); // Redirect to client registration page
      } else {
        router.push("/dashboard"); // Redirect to dashboard
      }
    } else {
      // If items are not set, handle accordingly (e.g., redirect to login)
      router.push("/");
    }
  }, [router]);

  return null; // This component doesn't render anything visually
};

export default CheckUserRole;
