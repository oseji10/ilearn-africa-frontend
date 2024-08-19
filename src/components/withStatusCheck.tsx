// components/withStatusCheck.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react'; // Assuming you're using next-auth

const withStatusCheck = (WrappedComponent, requiredStatus, redirectPath) => {

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
              },
            );
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
      
            setStatus(data.status);
          } catch (error) {
            console.error("Error fetching client ID:", error);
          }
        }
      };
  
      fetchClientId();
    }, []);
  return (props) => {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
      if (status === 'authenticated' && session.user.status !== requiredStatus) {
        router.push(redirectPath);
      }
    }, [status, session]);

    if (status === 'loading' || (status === 'authenticated' && session.user.status !== requiredStatus)) {
      return null; // You can return a loading spinner here if needed
    }

    return <WrappedComponent {...props} />;
  };
};

export default withStatusCheck;
