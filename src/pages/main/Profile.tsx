import React, { useEffect, useRef, useState } from "react";
import {
  User,
  Edit3,
  Camera,
  Heart,
  ShoppingBag,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Shield,
  Bell,
  Globe,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user, updateProfile, signout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    email: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    bio: "",
  });

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user?.email || "",
        fullName: user?.fullName || "",
        phone: user?.profile?.phoneNumber || "",
        dateOfBirth: user?.profile?.dateOfBirth || "",
        address: user?.profile?.address || "",
        bio: user?.profile?.bio || "",
      });
    }
  }, [user]);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Shield },
  ];

  const recentOrders = [
    {
      id: "#12345",
      date: "2024-01-15",
      status: "Delivered",
      total: "$299.99",
      items: 3,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
    },
    {
      id: "#12344",
      date: "2024-01-10",
      status: "In Transit",
      total: "$149.99",
      items: 1,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
    },
    {
      id: "#12343",
      date: "2024-01-05",
      status: "Processing",
      total: "$89.99",
      items: 2,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop",
    },
  ];

  const wishlistItems = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      price: "$2,399",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop",
      available: true,
    },
    {
      id: 2,
      name: "AirPods Pro Max",
      price: "$549",
      image:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150&h=150&fit=crop",
      available: true,
    },
    {
      id: 3,
      name: "iPhone 15 Pro",
      price: "$999",
      image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&h=150&fit=crop",
      available: false,
    },
  ];
  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (avatarPreview) {
      return avatarPreview;
    }

    if (user?.profile?.avatar) {
      // If it's already a full URL (Cloudinary or full path), return as is
      if (user.profile.avatar.startsWith("http")) {
        return user.profile.avatar;
      }
      // If it's a relative path, prepend the base URL
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
        "http://localhost:5000";
      return `${baseUrl}${user.profile.avatar}`;
    }

    // Fallback to default avatar
    return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop";
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(""); // Clear any previous errors

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false, // Explicitly disable audio
      });

      console.log("Stream obtained:", stream);
      console.log("Video tracks:", stream.getVideoTracks());

      setCameraStream(stream);
      setShowCamera(true);

      // Use setTimeout to ensure the video element is rendered
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          console.log("Stream assigned to video element");

          // Force play immediately
          videoRef.current
            .play()
            .then(() => {
              console.log("Video started playing successfully");
            })
            .catch((err) => {
              console.error("Video play failed:", err);
              setError("Failed to start camera preview");
            });
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);

      // More specific error messages
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permissions and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else {
        setError(
          "Unable to access camera. Please check permissions and try again."
        );
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Camera track stopped:", track.kind);
      });
      setCameraStream(null);
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setShowCamera(false);
  };
  // Add a test function to check camera availability
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        setError("No camera devices found on this device.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error checking camera availability:", err);
      setError("Unable to check camera availability.");
      return false;
    }
  };
  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not ready. Please try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is actually playing
    if (video.readyState < 2) {
      setError("Camera is still loading. Please wait and try again.");
      return;
    }

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob with better error handling
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", {
              type: "image/jpeg",
            });

            // Validate the file was created successfully
            if (file.size > 0) {
              setAvatarFile(file);
              setAvatarPreview(canvas.toDataURL("image/jpeg", 0.8));
              setShowAvatarModal(false);
              stopCamera();
              setError(""); // Clear any errors
            } else {
              setError("Failed to capture image. Please try again.");
            }
          } else {
            setError("Failed to create image from camera. Please try again.");
          }
        },
        "image/jpeg",
        0.8
      );
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo. Please try again.");
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle avatar file selection
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  // Process avatar file (common logic for file upload and camera capture)
  const processAvatarFile = (file) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB");
      return;
    }

    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e?.target?.result);
    };
    reader.readAsDataURL(file);

    setError("");
    setShowAvatarModal(false);
  };

  // Open avatar selection modal
  const openAvatarModal = () => {
    setShowAvatarModal(true);
    setError("");
  };

  // Close avatar modal and cleanup
  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let dataToSend;

      // If there's an avatar file, use FormData for multipart upload
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append(
          "profile[firstName]",
          profileData.fullName.split(" ")[0] || ""
        );
        formData.append(
          "profile[lastName]",
          profileData.fullName.split(" ")[1] || ""
        );
        formData.append(
          "profile[phoneNumber]",
          profileData.phone?.trim() || ""
        );
        formData.append("profile[address]", profileData.address?.trim() || "");
        // Add other profile fields to FormData
        // Object.keys(profileData).forEach((key) => {
        //   if (profileData[key]) {
        //     formData.append(key, profileData[key]);
        //   }
        // });

        dataToSend = formData;
      } else {
        // Send as regular JSON if no avatar
        const payload = {
          profile: {
            firstName: profileData.fullName.split(" ")[0],
            lastName: profileData.fullName.split(" ")[1] || "",
            phoneNumber: profileData.phone?.trim(),
            address: profileData.address?.trim(),
            avatar: getAvatarUrl(),
          },
        };
        dataToSend = payload;
      }

      await updateProfile(dataToSend);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");

    // Reset form data to original user data
    if (user) {
      setProfileData({
        email: user.email || "",
        fullName: user.fullName || "",
        phone: user?.profile?.phoneNumber || "",
        dateOfBirth: user?.profile?.dateOfBirth || "",
        address: user?.profile?.address || "",
        bio: user?.profile?.bio || "",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Please log in
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : user ? (
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 shadow-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-200">
                      {user?.email[0].toUpperCase()}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={openAvatarModal}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {user.fullName || "User"}
                </h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user?.profile?.address || "Location not set"}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Recently"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                isEditing ? handleCancelEdit() : setIsEditing(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Total Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700">Wishlist Items</span>
                  </div>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Total Spent</span>
                  </div>
                  <span className="font-semibold text-gray-900">$2,459</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h2>
                    {isEditing && (
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 py-3">
                          {profileData.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{profileData.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{profileData.phone||"-"}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">
                            {profileData.address || "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Orders
                    </h2>
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={order.image}
                          alt="Order item"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">
                              Order {order.id}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.items} items • {order.date}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {order.total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order History
                </h2>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order {order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {order.date}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700">{order.items} items</p>
                        <p className="text-xl font-bold text-gray-900">
                          {order.total}
                        </p>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Track Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  My Wishlist
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </button>
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-xl font-bold text-gray-900 mb-3">
                          {item.price}
                        </p>
                        <div className="space-y-2">
                          <button
                            disabled={!item.available}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {item.available
                              ? "Add to Cart"
                              : "Notify When Available"}
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Remove from Wishlist
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {wishlistItems.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start adding items you love to your wishlist
                    </p>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Browse Products
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Account Settings
                  </h2>
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive updates about your orders and account
                          </p>
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                      </button>
                    </div>

                    {/* Marketing Emails */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Marketing Emails
                          </p>
                          <p className="text-sm text-gray-600">
                            Get notified about new products and special offers
                          </p>
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-1"></span>
                      </button>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Language</p>
                          <p className="text-sm text-gray-600">
                            Choose your preferred language
                          </p>
                        </div>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Security
                  </h2>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Change Password
                          </p>
                          <p className="text-sm text-gray-600">
                            Update your account password
                          </p>
                        </div>
                      </div>
                      <div className="text-indigo-600">→</div>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>
                      <div className="text-indigo-600">→</div>
                    </button>

                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Payment Methods
                          </p>
                          <p className="text-sm text-gray-600">
                            Manage your saved payment methods
                          </p>
                        </div>
                      </div>
                      <div className="text-indigo-600">→</div>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                  <h2 className="text-xl font-semibold text-red-700 mb-6">
                    Danger Zone
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-medium text-red-800 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <button className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Update Profile Picture
                </h3>
                <button
                  onClick={closeAvatarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!showCamera ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Choose how you'd like to add your profile picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={async () => {
                        const isAvailable = await checkCameraAvailability();
                        if (isAvailable) {
                          startCamera();
                        }
                      }}
                      className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-indigo-600" />
                      <span className="font-medium text-gray-700">
                        Take Photo
                      </span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      <ShoppingBag className="w-6 h-6 text-indigo-600" />
                      <span className="font-medium text-gray-700">
                        Upload from Device
                      </span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Position yourself in the camera and click capture
                    </p>
                    {/* Add debug info */}
                    <p className="text-xs text-gray-500">
                      Camera status:{" "}
                      {cameraStream ? "Connected" : "Disconnected"}
                    </p>
                  </div>

                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", height: "256px" }} // Try inline styles
                      className="w-full h-64 object-cover rounded-lg bg-gray-100"
                      onLoadedMetadata={() => {
                        console.log("Video metadata loaded");
                        console.log(
                          "Video dimensions:",
                          videoRef.current?.videoWidth,
                          "x",
                          videoRef.current?.videoHeight
                        );
                      }}
                      onCanPlay={() => {
                        console.log(
                          "Video can play - dimensions:",
                          videoRef.current?.videoWidth,
                          "x",
                          videoRef.current?.videoHeight
                        );
                      }}
                      onPlaying={() => {
                        console.log("Video is now playing!");
                      }}
                      onError={(e) => {
                        console.error("Video error:", e);
                      }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Loading indicator */}
                    {cameraStream && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Camera Active
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraStream}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setShowCamera(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && !showAvatarModal && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
