"use client"
import StreamView from "@/components/StreamView";
import { useSession } from "next-auth/react";

 function Page() {
  const {data}=useSession()
  return (
    <>
      {
        data?.user?.userId  && <StreamView creatorId={data?.user?.userId} playVideo={true} />
      }
    </>
  )
}

export default Page;
