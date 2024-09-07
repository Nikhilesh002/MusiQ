import { prismaClient } from "@/lib/db";
import { UpvoteSchema } from "@/schemas/UpvoteSchema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,res:NextResponse){
  try {
    const session=await getServerSession();
    // TODO : replace with id
    if(!session?.user?.email){
      return NextResponse.json({message:"Unauthorised"},{status:401});
    }
    const user= await prismaClient.user.findFirst({
      where:{email:session.user.email}
    })
    if(!user){
      return NextResponse.json({message:"Unauthorised"},{status:401});
    }
    // now upvote
    const {streamId}=await req.json();
    const dbRes=await prismaClient.upvote.create({
      data:{
        userId:user.id,
        streamId
      }
    });
    return NextResponse.json({message:"Upvoted"},{status:200});
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({message:"Error in upvote"},{status:411});
  }
}