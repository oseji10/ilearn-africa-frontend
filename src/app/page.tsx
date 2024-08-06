// pages/index.js
// "use client"; // Add this at the top

import React, { useState } from 'react';
import ECommerce from "@/components/Dashboard/E-commerce";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
// import SignIn from "@/components/auth/signin/page";
import SignIn from './auth/signin/page';

export const metadata = {
  title: "iLearn Africa - Office Automation System",
  description: "The best e-learning platform in Africa",
};

const Home: React.FC = () => {
  return (
    <>
      {/* <DefaultLayout> */}
        {/* <ECommerce /> */}
        <SignIn />
      {/* </DefaultLayout> */}
    </>
  );
};

export default Home;
