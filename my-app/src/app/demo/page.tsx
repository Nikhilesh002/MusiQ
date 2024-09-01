"use client"

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import React from 'react'

function page() {
  return (
    <div>demo-page <Button onClick={()=>signIn()}>Sign in karo bhai</Button></div>
  )
}

export default page