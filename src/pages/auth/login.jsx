
import CommonForm from '@/components/common/form'
import { loginFromControls } from '@/config'
import api from '@/config/api'
import { useToast } from '@/hooks/use-toast'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
const initialState = {

  email : "",
  password : ""
}
const AuthLogin = () => {
   const [formData , setFormData ] = useState(initialState);
     const { toast } = useToast();
     const  navigate = useNavigate()
  
    const onSubmit = async(event)=>{
       event.preventDefault();
   try {
    const {  email, password } = formData;

    const response = await api.post('/api/v1/login', {
      email,
      password
    });
   
      if(response.data.success)
      {
         navigate('/shop/home');
        toast({  
          title : response.data.message
        })
      }
      window.location.reload()
            navigate('/shop/home');



  } catch (error) {
    console.log("error", error.response?.data || error.message);
     {
        toast({
          variant: "destructive",
          title : error.response?.data.message
        })
      }
  }

    }
    return (
      <div className='mx-auto w-full max-w-md space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tighter text-foreground'>Sign in to your Account</h1>
          <p className='mt-2'>Don't have an account <Link className=' font-medium text-blue-700 hover:underline '  to='/auth/register'>Sign up</Link></p>
        </div>
        <CommonForm
        formControls={loginFromControls}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        buttonText={"Login"}
        />
        <div>
          <Link to='/auth/forget-password'><span className='hover:underline text-blue-700 font-medium'>Forget Password ?</span></Link>
        </div>
      </div>
    )
}

export default AuthLogin
