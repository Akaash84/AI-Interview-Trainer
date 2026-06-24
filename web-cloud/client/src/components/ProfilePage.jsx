import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProfilePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Personal Information');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPosition: '',
    experience: '',
    skills: '',
    company: '',
    country: '',
    about: '',
    school: '',
    degree: '',
    graduationDate: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    newEmail: ''
  });

  const menuItems = [
    'Personal Information',
    'Education',
    'Delete Account'
  ];

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currentPosition: user.currentPosition || '',
        experience: user.experience || '',
        skills: user.skills || '',
        company: user.company || '',
        country: user.country || '',
        about: user.about || '',
        school: user.education?.school || '',
        degree: user.education?.degree || '',
        graduationDate: user.education?.graduationDate || ''
      }));
      
      if (user.profileImage?.url || user.imageUrl) {
        setProfileImage(user.profileImage?.url || user.imageUrl);
      }
    }
  }, [user]);

  const renderDeleteAccount = () => {
  

  const handleDelete = async () => {
    if (confirmText !== 'DELETE_MY_ACCOUNT') {
      showMessage('error', 'Please type DELETE_MY_ACCOUNT to confirm');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/profile/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmDelete: confirmText })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', data.message || 'Account deleted successfully');
        // Optionally log out user and redirect
        localStorage.removeItem('auth_token');
        window.location.href = '/signin';
      } else {
        showMessage('error', data.message || 'Failed to delete account');
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-red-800 mb-3">Delete Account</h3>
        <p className="text-sm text-red-700">
          This will permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Type <span className="font-bold">DELETE_MY_ACCOUNT</span> to confirm</label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE_MY_ACCOUNT"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <button
        onClick={handleDelete}
        disabled={loading}
        className={`px-6 py-3 rounded-xl text-white font-semibold transition-all ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg'
        }`}
      >
        {loading ? '⏳ Deleting...' : 'Delete My Account'}
      </button>
    </div>
  );
};


  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setProfileImage(data.data.profileImage.url);
        showMessage('success', 'Profile image updated successfully!');
      } else {
        showMessage('error', data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage('error', 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (loading) return;

    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (activeSection) {
        case 'Personal Information':
        
          endpoint = '/api/profile/personal';
          payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            currentPosition: formData.currentPosition,
            experience: formData.experience,
            skills: formData.skills,
            company: formData.company,
            country: formData.country,
            about: formData.about
          };
          break;

        case 'Education':
          endpoint = '/api/profile/education';
          payload = {
            school: formData.school,
            degree: formData.degree,
            graduationDate: formData.graduationDate
          };
          break;

        case 'Reset Password':
          if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            showMessage('error', 'All password fields are required');
            setLoading(false);
            return;
          }
          if (formData.newPassword !== formData.confirmNewPassword) {
            showMessage('error', 'New passwords do not match');
            setLoading(false);
            return;
          }
          endpoint = '/api/profile/password';
          payload = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmNewPassword: formData.confirmNewPassword
          };
          break;

        case 'Email Settings':
          if (!formData.newEmail) {
            showMessage('error', 'New email is required');
            setLoading(false);
            return;
          }
          endpoint = '/api/profile/email';
          payload = {
            newEmail: formData.newEmail
          };
          break;

        default:
          showMessage('error', 'Invalid section selected');
          setLoading(false);
          return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', data.message || `${activeSection} updated successfully!`);
        
        // Clear password fields after successful update
        if (activeSection === 'Reset Password') {
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          }));
        }
        
        // Clear new email field after successful update
        if (activeSection === 'Email Settings') {
          setFormData(prev => ({
            ...prev,
            newEmail: '',
            email: formData.newEmail // Update current email display
          }));
        }
      } else {
        showMessage('error', data.message || `Failed to update ${activeSection.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const renderContent = () => {
    switch (activeSection) {
      case 'Personal Information':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information form fields */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="abc@gmail.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Current Position</label>
                <input
                  type="text"
                  name="currentPosition"
                  value={formData.currentPosition}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Developer"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 years"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Skills</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., React, Node.js, Python"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Tech Company Inc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                >
                  <option value="">Select Country</option>
                  <option value="IN">India</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
            <div className="mt-10 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200">
              <label className="block text-sm font-bold text-gray-900 mb-3">About You</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Tell us about yourself, your background, and your professional goals..."
                rows="5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none bg-white"
              />
            </div>
          </div>
        );
      case 'Education':
        return (
          <div className="space-y-8">
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Education form fields */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">School/University</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="e.g., Stanford University"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor of Science"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Graduation Date</label>
                <input
                  type="date"
                  name="graduationDate"
                  value={formData.graduationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 bg-white"
                />
              </div>
            </div>
          </div>
        );
        case 'Delete Account':
          return renderDeleteAccount();
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h2a2 2 0 012 2v2m0 6a2 2 0 012-2h2a2 2 0 012 2v2m-6 2a2 2 0 002 2h2a2 2 0 002-2v-2m0-6a2 2 0 002-2h2a2 2 0 002 2v2" />
            </svg>
            <p className="mt-4 text-lg">
              Content for "{activeSection}" is coming soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-8 flex-shrink-0 shadow-lg">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b-2 border-gradient-to-r from-blue-200 to-indigo-200">
          <div className="relative mb-6">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-xl ring-4 ring-blue-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-blue-100">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md"></div>
          </div>
          <div className="text-center w-full">
            <h3 className="font-bold text-xl text-gray-900 truncate">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            </h3>
            <p className="text-sm text-gray-500 mt-2 truncate hover:text-gray-700 transition-colors">{user?.email}</p>
            {user?.currentPosition && (
              <div className="mt-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {user?.currentPosition}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`py-3 px-4 rounded-xl text-left font-medium transition-all duration-300 ${
                activeSection === item
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 pl-3 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:text-gray-900'
              }`}
              onClick={() => setActiveSection(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6 lg:p-12">
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl mx-auto overflow-hidden border border-gray-100">
          {/* Header Section */}
         

          {/* Message Display */}
          {message.text && (
            <div className={`mx-8 mt-6 p-4 rounded-xl border-l-4 shadow-md animate-in fade-in slide-in-from-top-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-500'
                : 'bg-red-50 text-red-800 border-red-500'
            }`}>
              <div className="flex items-center">
                <span className="mr-3 text-xl">
                  {message.type === 'success' ? '✓' : '✕'}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Profile Image Section */}
          {activeSection === 'Profile name' && (
          <div className="flex items-center space-x-8 px-8 py-10 border-b border-gray-200">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 border-4 border-blue-100 shadow-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <input
                type="file"
                id="profileImageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <label
                htmlFor="profileImageUpload"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer inline-block transition-colors shadow-md"
              >
                {loading ? 'Uploading...' : '📷 Change Photo'}
              </label>
              <p className="text-sm text-gray-500 mt-3">JPG, PNG, GIF up to 5MB</p>
            </div>
          </div>
          )}

          {/* Form Content */}
          <div className="px-8 py-12 bg-gradient-to-b from-white to-gray-50">
            {renderContent()}
          </div>

          {/* Action Buttons */}
          {activeSection !== 'Social' && (
            <div className="px-8 py-8 border-t-2 border-gray-100 flex justify-end space-x-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <button
                className="px-6 py-3 font-semibold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 hover:shadow-md"
                onClick={() => setActiveSection('Personal Information')}
              >
                Cancel
              </button>
              <button
                className={`px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:scale-105'
                }`}
                onClick={handleUpdate}
                disabled={loading}
              >
                <span>{loading ? '⏳ Saving...' : '✓ Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;