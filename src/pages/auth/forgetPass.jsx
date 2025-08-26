import CommonForm from '@/components/common/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { forgetPasswordFormConytrols } from '@/config';
import {
  sendOtp,
  verifyOtp,
  updatePassword,
  setError,
  resetForgetState
} from '@/store/ForgetSlice/forget-slice';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const initialState = {
  email: '',
  otp: '',
  password: ''
};

const AuthForgetPass = () => {
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate()
  const { loading, error, successMessage, otpSent, isOtpVerified } = useSelector(
    (state) => state.forget
  );
  const dispatch = useDispatch();


  // Derive current step from Redux flags
  const step = isOtpVerified ? 3 : otpSent ? 2 : 1;

  // Reset local state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetForgetState());
      setFormData(initialState);
    };
  }, [dispatch]);

  // Step 1 → Send OTP
  const handleForgetPassword = (e) => {
    e.preventDefault();
    if (!formData.email) {
      dispatch(setError('Please enter your email'));
      return;
    }
    dispatch(sendOtp({ email: formData.email }));
  };

  // Step 2 → Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 5) {
      dispatch(setError('Please enter a valid 5-digit OTP'));
      return;
    }
    dispatch(verifyOtp({ email: formData.email, otp: formData.otp }));
  };

  // Step 3 → Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!formData.password) {
      dispatch(setError('Please enter a new password'));
      return;
    }
    dispatch(updatePassword({ email: formData.email, password: formData.password }))
      .unwrap()
      .then(() => {
        setFormData(initialState);
        dispatch(resetForgetState());
        
        navigate('/auth/login')
      }).catch((error)=>{
        console.log("error" , error)

      })
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-foreground">Forget Password</h1>
        <p className="mt-2">
          If you know your password, go to{' '}
          <Link className="font-medium text-blue-700 hover:underline" to="/auth/login">
            Sign In
          </Link>
        </p>
      </div>

      {/* Step 1: Email input */}
      {step === 1 && (
        <CommonForm
          formControls={forgetPasswordFormConytrols}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleForgetPassword}
          loading={loading}
        />
      )}

      {/* Step 2: OTP input */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 flex flex-col items-center">
          <InputOTP
            maxLength={6}
            value={formData.otp}
            onChange={(val) => setFormData({ ...formData, otp: val })}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              
            </InputOTPGroup>
          </InputOTP>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {/* Step 3: New password input */}
      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full rounded bg-green-600 py-2 text-white"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Error / Success */}
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
    </div>
  );
};

export default AuthForgetPass;
