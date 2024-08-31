import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPen } from "@fortawesome/free-solid-svg-icons";
import ClickOutside from "@/components/ClickOutside";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [surName, setSurName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageUrl, setImage] = useState("");

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Network response was not ok');

      localStorage.removeItem('token');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
          setFirstName(data.firstname);
          setOtherNames(data.othernames);
          setSurName(data.surname);
          setPhoneNumber(data.phone_number);
          setImage(data.image_url);
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };
    fetchClientId();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/get-role`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setRole(data); // Assuming the role is returned in `data.role`
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  const roleLabels = {
    admin: 'ADMIN',
    client: 'CLIENT',
    super_admin: 'SUPER ADMIN',
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {firstName} {otherNames} {surName}<br/>
            {phoneNumber}
          </span>
          <span className="block text-xs">
            {roleLabels[role] || role}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <Image
            width={112}
            height={112}
            src={`${process.env.NEXT_PUBLIC_DOWNLOAD_LINK}${imageUrl}`}
            alt="User"
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
          />
        </svg>
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/profile/change-profile-image"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                 <FontAwesomeIcon icon={faCamera} />
                Change Profile Image
              </Link>
            </li>


            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z"
                  />
                  <path
                    d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0437 20.8656 18.4937 21.4156 17.7719 21.4156ZM4.2281 18.3481V19.9356H17.7719V18.3481H4.2281Z"
                  />
                </svg>
                Change Password
              </Link>
            </li>

            <li>
              <Link
                href="/"
                onClick={handleLogout}
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 18.375C5.25362 18.375 0.625 13.7464 0.625 8.00002C0.625 2.25362 5.25362 -2.375 11 -2.375C16.7464 -2.375 21.375 2.25362 21.375 8.00002C21.375 13.7464 16.7464 18.375 11 18.375ZM11 0.624985C6.16455 0.624985 2.375 4.41454 2.375 8.00002C2.375 11.5855 6.16455 15.375 11 15.375C15.8355 15.375 19.625 11.5855 19.625 8.00002C19.625 4.41454 15.8355 0.624985 11 0.624985Z"
                  />
                  <path
                    d="M12.5761 12.2822C12.1586 12.6997 11.4876 12.6997 11.0701 12.2822L8.8701 10.0822C8.4526 9.66473 8.4526 8.99373 8.8701 8.57622L11.0701 6.37622C11.4876 5.95873 12.1586 5.95873 12.5761 6.37622C12.9936 6.79372 12.9936 7.46473 12.5761 7.88222L11.4458 8.99485H16.875C17.6376 8.99485 18.2476 9.60485 18.2476 10.3674V11.8499C18.2476 12.6125 17.6376 13.2225 16.875 13.2225H11.4458L12.5761 12.2822Z"
                  />
                </svg>
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
