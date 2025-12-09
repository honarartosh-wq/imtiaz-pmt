import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { register as apiRegister } from '../../services/api';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

/**
 * Registration Form Component
 * Handles new user registration
 */
export function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referralCode: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate referral code
    if (!formData.referralCode) {
      setError('Branch referral code is required!');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        referralCode: formData.referralCode,
        accountType: formData.accountType === 'individual' ? 'standard' : 'business',
      };

      await apiRegister(userData);

      // Show success message
      alert(
        `✅ Account Created Successfully!\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nYou can now login with your credentials.`
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        referralCode: '',
        password: '',
        confirmPassword: '',
        accountType: 'individual',
      });

      // Call success callback
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMsg);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="tel"
        placeholder="Phone (Optional)"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        disabled={isLoading}
      />
      <Input
        type="text"
        placeholder="Branch Referral Code"
        value={formData.referralCode}
        onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
        disabled={isLoading}
        className="uppercase"
        required
      />

      {/* Account Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('accountType', 'individual')}
            className={`py-3 rounded-lg font-semibold transition-all ${
              formData.accountType === 'individual'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
            disabled={isLoading}
          >
            <div className="text-sm">Individual</div>
            <div className="text-xs opacity-75">Personal Trading</div>
          </button>
          <button
            type="button"
            onClick={() => handleChange('accountType', 'business')}
            className={`py-3 rounded-lg font-semibold transition-all ${
              formData.accountType === 'business'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
            disabled={isLoading}
          >
            <div className="text-sm">Business</div>
            <div className="text-xs opacity-75">Corporate Account</div>
          </button>
        </div>
      </div>

      <Input
        type="password"
        placeholder="Password (min 12 chars, uppercase, lowercase, number, special char)"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => handleChange('confirmPassword', e.target.value)}
        disabled={isLoading}
        required
      />

      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4 text-xs text-slate-300">
        <div className="font-semibold mb-2">📋 Available Branch Codes:</div>
        <div>
          <strong>MAIN001-REF</strong> - Main Branch
        </div>
        <div>
          <strong>DT002-REF</strong> - Downtown Branch
        </div>
        <div className="mt-2 text-slate-400">Get your referral code from your branch admin.</div>
      </div>
    </form>
  );
}

RegisterForm.propTypes = {
  onSuccess: PropTypes.func,
};
