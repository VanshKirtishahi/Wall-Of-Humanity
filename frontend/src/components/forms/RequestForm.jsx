import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import requestService from "../../services/request.service";
import donationService from "../../services/donation.service";
import Swal from 'sweetalert2';

const RequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const donationId = location.state?.donationId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [donation, setDonation] = useState(null);

  const [formData, setFormData] = useState({
    requestorName: "",
    email: "",
    contactNumber: "",
    address: "",
    reason: "",
    quantity: "",
    urgency: "normal",
  });

  useEffect(() => {
    // Check for both user and donationId
    if (!user) {
      navigate("/login");
      return;
    }

    if (!donationId) {
      console.log("Location state:", location.state);
      navigate("/");
      alert("Please select a donation first");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      requestorName: user.name || "",
      email: user.email || "",
      contactNumber: user.phone || "",
      address: user.address || "",
    }));

    const fetchDonationDetails = async () => {
      if (donationId) {
        try {
          const donationData = await donationService.getDonationById(donationId);
          setDonation(donationData);
        } catch (error) {
          console.error('Error fetching donation:', error);
          toast.error('Failed to fetch donation details');
        }
      }
    };
    
    fetchDonationDetails();
  }, [navigate, location.state, donationId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donationId) {
      setError("No donation selected");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // First create the request in database
      const requestData = {
        donation: donationId,
        requestorName: formData.requestorName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        reason: formData.reason,
        quantity: formData.quantity,
        urgency: formData.urgency,
        status: "pending",
      };

      const response = await requestService.createRequest(requestData);

      // Then send email notification
      const emailResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/email/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: formData.requestorName,
          email: formData.email || user.email,
          message: `
            <h2>New Donation Request</h2>
            <h3>Donation Details:</h3>
            <p>Title: ${donation?.title}</p>
            <p>Type: ${donation?.type}</p>
            <p>Description: ${donation?.description}</p>

            <h3>Requester Details:</h3>
            <p>Name: ${formData.requestorName}</p>
            <p>Contact: ${formData.contactNumber}</p>
            <p>Address: ${formData.address}</p>

            <h3>Request Details:</h3>
            <p>Reason: ${formData.reason}</p>
            <p>Quantity Needed: ${formData.quantity}</p>
            <p>Urgency Level: ${formData.urgency}</p>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || 'Failed to send email notification');
      }

      // Show success message and redirect
      setShowSuccess(true);
      Swal.fire({
        title: 'Request Submitted Successfully!',
        text: 'Your donation request has been received. We will notify the donor about your request.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6B46C1'
      }).then(() => {
        navigate('/', {
          state: {
            requestSuccess: true,
            message: 'Your request has been submitted successfully!'
          }
        });
      });

    } catch (error) {
      console.error('Request submission error:', error);
      toast.error(error.message || 'Failed to submit request');
      setError(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Request Donation
          </h2>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {showSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Request submitted successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="requestorName"
                value={formData.requestorName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Reason for Request
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Quantity Needed
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Urgency Level
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 font-medium shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
