import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { SearchableDropdown } from '../../ui/SearchableDropdown';
import { KeyIcon, RefreshCwIcon, SendIcon, CheckIcon, AlertCircleIcon, UserIcon } from 'lucide-react';
import sepUsersService, { SepUser } from '../../../services/sepUsersService';
import emailService from '../../../services/emailService';
import { useToast, ToastContainer } from '../../ui/Toast';

interface UserOption {
  value: number;
  label: string;
  email: string;
  name: string;
  active: number;
}

export function SendPassword() {
  const { toasts, removeToast, success, error } = useToast();
  
  // State management
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load active users on component mount
  useEffect(() => {
    loadActiveUsers();
  }, []);

  const loadActiveUsers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await sepUsersService.getActive();
      const usersArray = Array.isArray(data) ? data : [];
      
      // Transform users to options for dropdown
      const userOptions: UserOption[] = usersArray.map(user => ({
        value: user.id,
        label: `${user.name || user.username} (${user.email})`,
        email: user.email,
        name: user.name || user.username,
        active: user.active
      }));
      
      setUsers(userOptions);
    } catch (err: any) {
      console.error('Error loading active users:', err);
      setApiError(err.message || 'Failed to load active users');
      error('Failed to load active users', err.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    setIsGenerating(true);
    
    // Simulate generation delay for better UX
    setTimeout(() => {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
      let password = '';
      
      // Ensure at least one of each type
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%&*';
      
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
      
      // Fill the rest randomly
      for (let i = 4; i < 12; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }
      
      // Shuffle the password
      const shuffled = password.split('').sort(() => 0.5 - Math.random()).join('');
      setGeneratedPassword(shuffled);
      setIsGenerating(false);
      
      success('Password Generated', 'A secure password has been generated successfully');
    }, 800);
  };

  const handleUserSelect = (userId: string | number) => {
    setSelectedUserId(Number(userId));
    // Clear previous password when user changes
    if (generatedPassword) {
      setGeneratedPassword('');
    }
  };

  const handleSendPassword = async () => {
    if (!selectedUserId) {
      error('Validation Error', 'Please select a user first');
      return;
    }

    if (!generatedPassword) {
      error('Validation Error', 'Please generate a password first');
      return;
    }

    try {
      setIsSending(true);

      const selectedUser = users.find(user => user.value === selectedUserId);
      
      if (!selectedUser) {
        throw new Error('Selected user not found');
      }

      // Prepare email content
      const subject = 'Your New Password - UTender';
      const message = `
Hello ${selectedUser.name},

Your new password for UTender has been generated:

Password: ${generatedPassword}

For security reasons, please log in and change this password as soon as possible.

If you did not request this password reset, please contact our support team immediately.

Best regards,
The UTender Team
      `.trim();

      // Send email using the email service
      const requestData = {
        recipientType: 'specific',
        specificUsers: [selectedUserId],
        subject: subject,
        message: message,
        template: 'custom'
      };

      const response = await emailService.sendEmail(requestData);
      
      if (response.success) {
        success(
          'Password Sent Successfully!',
          `New password has been sent to ${selectedUser.email}`
        );
        
        // Reset form
        setSelectedUserId(null);
        setGeneratedPassword('');
      } else {
        throw new Error(response.message || 'Failed to send password');
      }
    } catch (err: any) {
      console.error('Error sending password:', err);
      error('Failed to Send Password', err.response?.data?.message || err.message || 'Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const selectedUser = users.find(user => user.value === selectedUserId);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{apiError}</div>
            <Button onClick={loadActiveUsers} variant="primary">Retry</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <KeyIcon className="h-6 w-6 mr-2 text-blue-600" />
            Send Password
          </h1>
          <p className="text-gray-600 mt-1">Generate and send new passwords to active users</p>
        </div>

        <Card>
          <div className="space-y-6">
            {/* User Selection */}
            <div>
              <SearchableDropdown
                label="Select User"
                options={users.map(user => ({
                  value: user.value,
                  label: user.label
                }))}
                value={selectedUserId || ''}
                onChange={handleUserSelect}
                placeholder="Search and select a user..."
                searchPlaceholder="Type to search users by name or email..."
                disabled={loading}
                helpText={`${users.length} active users available`}
              />
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Selected User</h3>
                    <p className="text-sm text-blue-700">
                      <strong>Name:</strong> {selectedUser.name}<br />
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Password
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    className="block w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Click 'Generate Password' to create a secure password"
                    value={generatedPassword}
                    readOnly
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  icon={<RefreshCwIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />}
                  onClick={generatePassword}
                  disabled={isGenerating}
                  className="px-6"
                >
                  {isGenerating ? 'Generating...' : 'Generate Password'}
                </Button>
              </div>
              {generatedPassword && (
                <p className="mt-2 text-xs text-gray-500">
                  ✅ Password generated successfully. It contains uppercase, lowercase, numbers, and special characters.
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 12 characters long</li>
                <li>• Contains uppercase letters (A-Z)</li>
                <li>• Contains lowercase letters (a-z)</li>
                <li>• Contains numbers (0-9)</li>
                <li>• Contains special characters (!@#$%&*)</li>
                <li>• Randomly generated for maximum security</li>
              </ul>
            </div>

            {/* Send Password Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="primary"
                icon={<SendIcon className="h-4 w-4" />}
                onClick={handleSendPassword}
                disabled={!selectedUserId || !generatedPassword || isSending}
                className="min-w-[160px]"
              >
                {isSending ? 'Sending...' : 'Send Password'}
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-amber-900">Important Security Notice</h4>
                  <p className="text-amber-700 mt-1">
                    The generated password will be sent via email to the selected user. 
                    Advise them to change it immediately after logging in for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}