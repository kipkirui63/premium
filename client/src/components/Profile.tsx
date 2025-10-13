import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Calendar, CreditCard, X, AlertCircle, User, Mail, Phone, Edit3, Shield, DollarSign, Clock, Eye, EyeOff } from 'lucide-react';

interface Subscription {
  id: number;
  tool: number;
  tool_name: string;
  tool_description: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'account'>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string | null>(null);

  // Fetch user's subscriptions
  const { data: subscriptions, isLoading, error } = useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://all.staging.crispai.ca/api/subscription/my-subscriptions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://all.staging.crispai.ca/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordErrors(null);
    },
    onError: (error: any) => {
      setPasswordErrors(error.message || 'Failed to change password');
    },
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async (subscriptionId: number) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://all.staging.crispai.ca/api/subscription/cancel/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to cancel subscription');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setShowCancelDialog(null);
      setCancelingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription');
      setCancelingId(null);
    },
  });

  const handleCancelSubscription = async (subscriptionId: number) => {
    setCancelingId(subscriptionId);
    await cancelSubscription.mutateAsync(subscriptionId);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors(null);

    // Validation
    if (!passwordForm.current_password) {
      setPasswordErrors('Current password is required');
      return;
    }
    if (!passwordForm.new_password) {
      setPasswordErrors('New password is required');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordErrors('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordErrors('Passwords do not match');
      return;
    }

    await changePassword.mutateAsync({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanDisplayName = (planType: string) => {
    return planType === 'monthly' ? 'Monthly' : 'Yearly';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
  const totalSubscriptions = subscriptions?.length || 0;
  const canceledSubscriptions = subscriptions?.filter(sub => sub.status === 'canceled').length || 0;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSubscriptions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSubscriptions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canceled</p>
              <p className="text-2xl font-semibold text-gray-900">{canceledSubscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {activeSubscriptions.length > 0 ? (
            <div className="space-y-4">
              {activeSubscriptions.slice(0, 3).map((subscription) => (
                <div key={subscription.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.tool_name} - {getPlanDisplayName(subscription.plan_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Active since {formatDate(subscription.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">My Subscriptions</h2>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading subscriptions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load subscriptions</p>
          </div>
        ) : !subscriptions || subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No subscriptions found</p>
            <p className="text-sm text-gray-500 mt-1">Browse our marketplace to find tools that suit your needs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.tool_name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{subscription.tool_description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <span>{getPlanDisplayName(subscription.plan_type)} Plan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Started {formatDate(subscription.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => setShowCancelDialog(subscription.id)}
                      className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{user.first_name}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{user.last_name}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Last updated: Recently</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verification</p>
                    <p className="text-xs text-gray-500">Your email is verified</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates about your subscriptions</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscriptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
        {activeTab === 'account' && renderAccountSettings()}

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
                  <button
                    onClick={() => setShowCancelDialog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600">
                    Are you sure you want to cancel this subscription? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelDialog(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(showCancelDialog)}
                    disabled={cancelingId === showCancelDialog}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {cancelingId === showCancelDialog ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                      setPasswordErrors(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {passwordErrors && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{passwordErrors}</p>
                  </div>
                )}
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            current_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirm_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({
                          current_password: '',
                          new_password: '',
                          confirm_password: '',
                        });
                        setPasswordErrors(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changePassword.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
                    >
                      {changePassword.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;