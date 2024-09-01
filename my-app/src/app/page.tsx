"use client"

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div className="">
      <Button onClick={()=>signIn()}>Sign in karo bhai</Button>
    </div>
  );
}
