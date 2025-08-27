import CommonForm from '@/components/common/form'
import { registerFromControls } from '@/config'
import api from '@/config/api';
import { useToast } from '@/hooks/use-toast';
// import axios from 'axios';
// import { registerUser } from '@/store/auth-slice/AuthSlice'
import React, { useState } from 'react'
// import { useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom'
const initialState = {
  username : "",
  email : "",
  password : ""
}
const AuthRegister = () => {
  // const dispatch = useDispatch()
  const [formData , setFormData ] = useState(initialState)
    const navigate = useNavigate();
  const { toast } = useToast();

 const onSubmit = async (event) => {
  event.preventDefault();


  try {
    const { username, email, password } = formData;

    const response = await api.post('/api/v1/register', {
      username,
      email,
      password
    });
      if (response.data.success) {
        toast({
          title : response.data.message
        })
      }
      navigate('/auth/login')

  } catch (error) {
    console.log("error", error.response?.data || error.message);
    // Optionally show error to user
    {
        toast({
          variant: "destructive",
          title : error.response?.data.message
        })
      }
  }
};

  return (
    <div className='mx-auto w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold tracking-tighter text-foreground'>Create New Account</h1>
        <p className='mt-2'>Already have an account  <Link className=' font-medium text-blue-700 hover:underline '  to='/auth/login'>Login</Link></p>
      </div>
      <CommonForm
      formControls={registerFromControls}
      formData={formData}
      setFormData={setFormData}
      onSubmit={onSubmit}
      buttonText={"Sign Up "}
      />
    </div>
  )
}

export default AuthRegister