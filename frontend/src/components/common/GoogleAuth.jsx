import React, { useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import {app} from '../../firebase'
import LoadingBar from 'react-top-loading-bar'

export default function GoogleAuth({width}) {

    const HOST = import.meta.env.VITE_URL

    const auth = getAuth(app);

    let [progress,setProgress] = useState(0)


    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: "select_account"
        });
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            
            // Get the user's ID token from Firebase
            const token = await resultsFromGoogle.user.getIdToken();
    
            // Send the token along with user data to your backend
            setProgress(10)
            const res = await fetch(`${HOST}/api/auth/google`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    fullName: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    token // Send the token
                })
            });
            setProgress(30)
    
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            setProgress(80)
            // Store the JWT token in localStorage
            localStorage.setItem("auth-token", data.token);
    
            window.location.href = "/"
        } catch (error) {
            console.error(error);
        }finally{
            setProgress(0)
        }
    };
    


  return (
    <div className='my-4'>
        <LoadingBar color='rgb(29, 155, 240)' progress={progress} height={3} />
        <button type='button' onClick={handleGoogleClick} className={`bg-white w-${width} py-3 p-2 rounded-full flex justify-center items-center text-black font-semibold text-sm `}>
            <FcGoogle className='mr-2 w-5 h-5' />
            continue with google
        </button>      
    </div>
  )
} 
