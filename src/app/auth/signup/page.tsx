"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// export const metadata = {
//   title: "iLearn Africa | Office Automation System",
//   description: "Ready for Africa",
// };

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstname, setFirstName] = useState("");
  const [surname, setSurName] = useState("");
  const [othernames, setOtherNames] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
setIsSubmitting(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        phone_number: phoneNumber,
        firstname: firstname,
        surname: surname,
        othernames: othernames
        // password: "temporaryPassword123", // Temporary password or generate a random one
      }),
      mode: 'cors' // Ensure CORS mode is set
    });

    if (response.ok) {
      // Handle successful registration (e.g., redirect to login page)
      setSuccess("Profile created successfully!");
      router.push("/auth/signin");
    } else {
      // Handle error
      const data = await response.json();
      setError(data.message);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (error || success) {
      const duration = 5000; // Duration in milliseconds
      const interval = 100; // Update interval in milliseconds
      const steps = duration / interval;
      let currentStep = 0;

      setProgress(100);

      const timer = setInterval(() => {
        currentStep++;
        setProgress((100 * (steps - currentStep)) / steps);

        if (currentStep >= steps) {
          clearInterval(timer);
          setError(""); // Hide the error after duration
          setSuccess(""); // Hide the success after duration
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [error, success]);

  return (
    
    
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
{success && (
        <div className="fixed top-4 right-4 w-80 h-24 bg-green-500 text-white rounded-md shadow-lg flex flex-col p-4">
          <div className="flex items-start mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-green-700 rounded-full">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z"
                  fill="#ffffff"
                  stroke="#ffffff"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h5 className="text-lg font-semibold">Success</h5>
              <p>{success}</p>
            </div>
          </div>
          <div className="relative flex-grow">
            <div
              className="absolute bottom-0 left-0 bg-green-700 h-1"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            ></div>
          </div>
        </div>
      )}


      {error && (
        <div className="fixed top-4 right-4 w-80 h-24 bg-red-500 text-white rounded-md shadow-lg flex flex-col p-4" style={{backgroundColor:"crimson"}}>
          <div className="flex items-start mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-red-700 rounded-full">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.4917 7.65579L11.106 12.2645C11.2545 12.4128 11.4715 12.5 11.6738 12.5C11.8762 12.5 12.0931 12.4128 12.2416 12.2645C12.5621 11.9445 12.5623 11.4317 12.2423 11.1114C12.2422 11.1113 12.2422 11.1113 12.2422 11.1113C12.242 11.1111 12.2418 11.1109 12.2416 11.1107L7.64539 6.50351L12.2589 1.91221L12.2595 1.91158C12.5802 1.59132 12.5802 1.07805 12.2595 0.757793C11.9393 0.437994 11.4268 0.437869 11.1064 0.757418C11.1063 0.757543 11.1062 0.757668 11.106 0.757793L6.49234 5.34931L1.89459 0.740581L1.89396 0.739942C1.57364 0.420019 1.0608 0.420019 0.740487 0.739944C0.42005 1.05999 0.419837 1.57279 0.73985 1.89309L6.4917 7.65579ZM6.4917 7.65579L1.89459 12.2639L1.89395 12.2645C1.74546 12.4128 1.52854 12.5 1.32616 12.5C1.12377 12.5 0.906853 12.4128 0.758361 12.2645L1.1117 11.9108L0.758358 12.2645C0.437984 11.9445 0.437708 11.4319 0.757539 11.1116C0.757812 11.1113 0.758086 11.111 0.75836 11.1107L5.33864 6.50287L0.740487 1.89373L6.4917 7.65579Z"
                  fill="#ffffff"
                  stroke="#ffffff"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h5 className="text-lg font-semibold">Error</h5>
              <p>{error}</p>
            </div>
          </div>
          <div className="relative flex-grow">
            <div
              // className="absolute bottom-0 bg-red-500 text-white rounded-md shadow-lg"
              style={{ width: `${progress}%`, transition: 'width 0.1s linear', color:"black", backgroundColor:"cornsilk" }}
            ></div>
          </div>
        </div>
      )}

        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="px-26 py-17.5 text-center">
              <Link className="mb-5.5 inline-block" href="/">
                <Image
                  className="hidden dark:block"
                  src={"/images/logo/iLearn-Africa.png"}
                  alt="Logo"
                  width={176}
                  height={32}
                />
                <Image
                  className="dark:hidden"
                  src={"/images/logo/ilearn-logo.png"}
                  alt="Logo"
                  width={176}
                  height={32}
                />
              </Link>
              <p className="2xl:px-20">
              Ilearn Africa provides learning platforms and opportunities for personal & professional advancement.
              </p>

              <span className="mt-15 inline-block">
                <svg
                  width="350"
                  height="350"
                  viewBox="0 0 350 350"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                </svg>
              </span>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <span className="mb-1.5 block font-medium">New?</span>
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign Up to iLearn Africa
              </h2>

              {error && (
                <div className="mb-4 text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
              <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Firstname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstname"
                      placeholder="Enter your Firstname"
                      value={firstname}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />

                    <span className="absolute right-4 top-4">
                      <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Surname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="surname"
                      placeholder="Enter your Surname"
                      value={surname}
                      onChange={(e) => setSurName(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />

                    <span className="absolute right-4 top-4">
                      <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Othernames
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="othernames"
                      placeholder="Enter your Firstname"
                      value={othernames}
                      onChange={(e) => setOtherNames(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />

                    <span className="absolute right-4 top-4">
                      <FontAwesomeIcon icon={faUser} className="fill-current" size="lg" />
                    </span>
                  </div>
                </div>


                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="phone_number"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />

                    <span className="absolute right-4 top-4">
                      <FontAwesomeIcon icon={faPhone} className="fill-current" size="lg" />
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />

                    <span className="absolute right-4 top-4">
                      <FontAwesomeIcon icon={faEnvelope} className="fill-current" size="lg" />
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                <button
  type="submit"
  disabled={isSubmitting}
  className={`w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${
    isSubmitting ? "cursor-not-allowed opacity-50" : ""
  }`}
>
  {isSubmitting ? (
    <span>
      Please wait... <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
    </span>
  ) : (
    'Sign In'
  )}
</button>
                </div>

                <button className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50">
                  <span>
                  </span>
                  Sign up with Google
                </button>

                <div className="mt-6 text-center">
                  <p>
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-primary">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    // </DefaultLayout>
  );
};

export default SignUp;
