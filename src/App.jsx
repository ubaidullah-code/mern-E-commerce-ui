import React, { useContext, useEffect } from 'react';
import CustomRoutes from './components/common/CustomRoutes';

import api from './config/api'; // Assuming you have a configured axios instance
import { GlobalContext } from './Context/context.jsx';


const App = () => {
  const { state , dispatch } = useContext(GlobalContext);

 useEffect(() => {
  // console.log("state", state);
    const getUserData = async() => {
      try {
        let res = await api.get('api/v1/check-auth' , { withCredentials: true });
        
      dispatch({type: "USER_LOGIN", payload: res.data?.user})
    
     
        
      } catch (error) {
        dispatch({type: "USER_LOGOUT"})
      }
    }
    getUserData();
  } , [state.isLogin])
 // The dependency array ensures this runs only once on mount

  return (
    <div className='flex flex-col overflow-hidden bg-white'>
      <CustomRoutes />
    </div>
  );
};

export default App;