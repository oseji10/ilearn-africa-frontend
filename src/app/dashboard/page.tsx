import React from 'react';
import ECommerce from '@/components/Dashboard/E-commerce';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProtectedRoute from '@/content/ProtectedRoute'



// export const metadata = {
//   title: "iLearn Africa - Office Automation System",
//   description: "The best e-learning platform in Africa",
// };

const Dashboard: React.FC = () => {
  return (
    <>
       <DefaultLayout>
        <ECommerce />
        
      </DefaultLayout>
    </>
  );
};

export default Dashboard;
