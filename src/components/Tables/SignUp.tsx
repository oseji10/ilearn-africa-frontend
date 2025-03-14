"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEnvelope,
  faPhone,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

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
  const [successMessage, setSuccessMessage] = useState("")

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
        }),
        mode: "cors",
      }
    );

    if (response.ok) {
      const data = await response.json();
      setSuccess(data.message);
      setSuccessMessage(data.message);
      setEmail('');
    setPhoneNumber('');
    setFirstName('');
    setSurName('');
    setOtherNames('');
    setIsSubmitting(false);
    const timer = setTimeout(() => {
      router.push("/auth/signin");
    }, 10 * 4000);
    } else {
      const data = await response.json();
      setIsSubmitting(false);
      setError(data.message);
      setError(data.errors.phone_number);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (error || success) {
      const duration = 5000;
      const interval = 400;
      const steps = duration / interval;
      let currentStep = 0;

      setProgress(400);

      const timer = setInterval(() => {
        currentStep++;
        setProgress((400 * (steps - currentStep)) / steps);

        if (currentStep >= steps) {
          clearInterval(timer);
          setError("");
          setSuccess("");
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [error, success, successMessage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 relative ">
      {/* Success Popup */}
      {success && (
        <div className="fixed right-4 top-4 flex h-35 w-80 flex-col rounded-md bg-green-500 p-4 text-white shadow-lg">
          <div className="mb-2 flex items-start">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700"> */}
            <div className="flex-shrink-0">
              {/* Success Icon */}
              <FontAwesomeIcon icon={faCheck} size="2x" />
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

{/* {success && (
  <div className="relative w-full rounded-lg p-4 flex md:items-center items-start space-x-4 rtl:space-x-reverse bg-success bg-opacity-10 border-current text-success"><div className="text-sm [&amp;_p]:leading-relaxed grow">{success}</div></div>
)} */}

      {/* Error Popup */}
      {error && (
        <div style={{background: 'red'}} className="fixed top-4 right-4 flex items-start bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 w-80">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
          <div className="ml-3">
            <h5 className="text-lg font-semibold">Error</h5>
            <p>{error}</p>
            <div className="mt-2 w-full bg-red-700 h-1">
              <div
                className="bg-red-900 h-1"
                style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
              ></div>
            </div>
          </div>
        </div>
      )}

{/* {successMessage && (
  <p className="bg-green-100 text-black p-4 rounded-md sm:text-sm md:text-base lg:text-lg">{successMessage}</p>
)} */}

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row">
        {/* Left Side - Logo and Description */}
        
        <div className="md:w-1/2 flex flex-col items-center justify-center p-4">

          {/* <Link href="/"> */}
            <a href="/">
              <Image
                className="hidden dark:block"
                src="/images/logo/iLearn-Africa.png"
                alt="Logo"
                width={150}
                height={30}
              />
              <Image
                className="block dark:hidden"
                src="/images/logo/ilearn-logo.png"
                alt="Logo"
                width={150}
                height={30}
              />
            </a>
          {/* </Link> */}
          <h2 className="mt-4 text-2xl font-bold text-center text-black dark:text-white">
            Welcome to iLearn Africa Office Management System
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            Ilearn Africa provides learning platforms and opportunities for personal & professional advancement.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white text-center">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Firstname */}
              <div className="relative">
                <input
                  required
                  type="text"
                  name="firstname"
                  placeholder="Firstname"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <FontAwesomeIcon icon={faUser} />
                </span>
              </div>

              {/* Surname */}
              <div className="relative">
                <input
                  required
                  type="text"
                  name="surname"
                  placeholder="Surname"
                  value={surname}
                  onChange={(e) => setSurName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <FontAwesomeIcon icon={faUser} />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Othernames */}
              <div className="relative">
                <input
                  type="text"
                  name="othernames"
                  placeholder="Othernames"
                  value={othernames}
                  onChange={(e) => setOtherNames(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <FontAwesomeIcon icon={faUser} />
                </span>
              </div>

              {/* Phone Number */}
              <div className="relative">
                <input
                  required
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <FontAwesomeIcon icon={faPhone} />
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="relative mb-4">
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 pl-10 text-black focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col space-y-4">
            <button
  type="submit"
  disabled={isSubmitting}
  className="w-full flex items-center justify-center rounded-lg bg-primary text-white py-2 hover:bg-primary-dark disabled:opacity-50"
>
  {isSubmitting ? (
    <>
      Please wait... <FontAwesomeIcon icon={faSpinner} spin />
    </>
  ) : (
    "Sign Up"
  )}
</button>


              {/* <button
                type="button"
                className="w-full flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 text-black py-2 hover:bg-gray-200"
              >
                <Image
                  src="/images/google.webp"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                
                
                Sign Up with Google
              </button> */}
            </div>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              {/* <Link href="/auth/signin"> */}
                <a className="text-primary hover:underline" href="/auth/signin">Sign In</a>
              {/* </Link> */}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;








