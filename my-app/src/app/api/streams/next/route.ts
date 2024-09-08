import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(){
  const session=await getServerSession();
  if(!session?.user?.email){
    return NextResponse.json({message:"Unauthorised"},{status:401});
  }
  const user= await prismaClient.user.findFirst({
    where:{email:session.user.email}
  })
  if(!user){
    return NextResponse.json({message:"Unauthorised"},{status:401});
  }
  const mostUpvotedStream=await prismaClient.stream.
}