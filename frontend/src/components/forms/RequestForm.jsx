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
    urgency: "normal",
    message: '',
    status: 'pending'
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

  useEffect(() => {
    if (donation) {
      setFormData(prev => ({
        ...prev,
        availableQuantity: donation.quantity || 0
      }));
    }
  }, [donation]);

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

    if (!formData.reason) {
      toast.error("Please provide a reason for your request");
      return;
    }

    if (!donation) {
      toast.error("Donation details not found");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const requestData = {
        donation: donationId,
        requestorName: formData.requestorName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        reason: formData.reason,
        urgency: formData.urgency,
        status: "pending"
      };
      
      const response = await requestService.createRequest(requestData);

      // Update donation status
      try {
        await donationService.updateDonation(donationId, {
          status: 'requested'
        });
        
        // Update local donation state
        setDonation(prev => ({
          ...prev,
          status: 'requested'
        }));
      } catch (updateError) {
        console.error('Failed to update donation status:', updateError);
      }

      // Send email notification
      try {
        const emailData = {
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
            <p>Reason: ${formData.reason}</p>
          `
        };

        await fetch(`${import.meta.env.VITE_API_URL}/email/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      setShowSuccess(true);
      Swal.fire({
        title: 'Request Submitted Successfully!',
        text: 'Your donation request has been received.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6B46C1'
      }).then(() => {
        navigate('/', { 
          state: { 
            requestSuccess: true,
            updatedDonationId: donationId,
            updatedStatus: 'requested'
          } 
        });
      });

    } catch (error) {
      console.error('Request submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
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
