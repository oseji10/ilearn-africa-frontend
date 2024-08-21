"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          phone_number: phoneNumber,
          firstname: firstname,
          surname: surname,
          othernames: othernames,
          // password: "temporaryPassword123", // Temporary password or generate a random one
        }),
        mode: "cors", // Ensure CORS mode is set
      },
    );

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
        <div className="fixed right-4 top-4 flex h-24 w-80 flex-col rounded-md bg-green-500 p-4 text-white shadow-lg">
          <div className="mb-2 flex items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700">
              {/* Success Icon */}
            </div>
            <div className="ml-3">
              <h5 className="text-lg font-semibold">Success</h5>
              <p>{success}</p>
            </div>
          </div>
          <div className="relative flex-grow">
            <div
              className="absolute bottom-0 left-0 h-1 bg-green-700"
              style={{
                width: `${progress}%`,
                transition: "width 0.1s linear",
              }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="bg-red-500 fixed right-4 top-4 flex h-24 w-80 flex-col rounded-md p-4 text-white shadow-lg"
          style={{ backgroundColor: "crimson" }}
        >
          <div className="mb-2 flex items-start">
            <div className="bg-red-700 flex h-10 w-10 items-center justify-center rounded-full">
              {/* Error Icon */}
            </div>
            <div className="ml-3">
              <h5 className="text-lg font-semibold">Error</h5>
              <p>{error}</p>
            </div>
          </div>
          <div className="relative flex-grow">
            <div
              className="absolute bottom-0 left-0 h-1 bg-red-700"
              style={{
                width: `${progress}%`,
                transition: "width 0.1s linear",
              }}
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
              Ilearn Africa provides learning platforms and opportunities for
              personal & professional advancement.
            </p>

            <span className="mt-15 inline-block">
              <svg
                width="350"
                height="350"
                viewBox="0 0 350 350"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              ></svg>
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">New?</span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Sign Up to iLearn Africa
            </h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}

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
                    <FontAwesomeIcon
                      icon={faUser}
                      className="fill-current"
                      size="lg"
                    />
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
                    <FontAwesomeIcon
                      icon={faUser}
                      className="fill-current"
                      size="lg"
                    />
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
                    <FontAwesomeIcon
                      icon={faUser}
                      className="fill-current"
                      size="lg"
                    />
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
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="fill-current"
                      size="lg"
                    />
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
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="fill-current"
                      size="lg"
                    />
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
                      Please wait...{" "}
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <button className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50">
                <span></span>
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
