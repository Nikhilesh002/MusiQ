"use client"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function Redirect() {
  const session=useSession();
  const router=useRouter();
  useEffect(()=>{
    if(session?.status==="authenticated"){
      router.push('/dashboard');
    }
  },[session,router])
  return null;
}

export default Redirect;
