"use client";
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons/faFilePdf';

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token'); // Replace with the key used for your token
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(response.data.payments);
        console.log(response.data.payments)
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleEyeClick = (payment) => {
    setSelectedPayment(payment);
  };

  const closeModal = () => {
    setSelectedPayment(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedPayment) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedPayment]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead >
              <tr style={{textAlign: 'left'}} className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white">
                  Client ID
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Client Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Transacton Reference
                </th>
               
                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Payment Date
                </th>

                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  Status
                </th>

                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, key) => (
                <tr key={key}>
                   <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {payment.client_id}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <h5 className="font-medium text-black dark:text-white">
                      {payment.clients.firstname} {payment.clients.othernames} {payment.clients.surname}
                    </h5>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <h5 className="font-medium text-black dark:text-white">
                      {payment.transaction_reference}
                    </h5>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {payment.created_at}
                    </p>
                  </td>
                 

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p 
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      payment.status === 1
                        ? "bg-success text-success"
                        : payment.status === 0
                          ? "bg-danger text-danger"
                          : ""
                    }`}
                    
                    >
                      {payment.status === 1 ? "PAID" : payment.status === 0 ? "UNPAID" : "N/A"}
                    </p>
                  </td>

                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <button className="hover:text-primary" onClick={() => handleEyeClick(payment)}>
                        <FontAwesomeIcon icon={faEye} className="fill-current" size="sm" />
                      </button>
                      <button className="hover:text-primary">
                        <FontAwesomeIcon icon={faPrint} className="fill-current" size="sm" />
                      </button>
                      {/* <button className="hover:text-primary">
                        <FontAwesomeIcon icon={faTrash} className="fill-current" size="sm" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            ref={modalRef}
          >
            <h2 className="text-xl font-semibold mb-4">PAYMENT DETAILS</h2>
            <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
            <hr/><br/>
            <table width={"100%"}>
              <tbody>
              <tr>
                <td width={"25%"}><strong>Client ID:</strong></td>
                <td>{selectedPayment.client_id}</td>
              </tr>

              {/* <tr>
                <td width={"15%"}><strong>Name:</strong></td>
                <td>{selectedPayment.firstname} {selectedPayment.lastname} {selectedPayment.othernames}</td>
              </tr>

              <tr>
                <td width={"15%"}><strong>Email:</strong></td>
                <td>{selectedClient.user?.email}</td>
              </tr>

              <tr>
                <td width={"15%"}><strong>Phone Number:</strong></td>
                <td>{selectedClient.user?.phone_number}</td>
              </tr>

              <tr>
                <td width={"15%"}><strong>Gender:</strong></td>
                <td>{selectedClient.gender}</td>
              </tr> */}

         
              </tbody>
            </table>

       


            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
