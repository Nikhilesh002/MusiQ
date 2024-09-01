import { prismaClient } from "@/lib/db";
import { UpvoteSchema } from "@/schemas/UpvoteSchema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,res:NextResponse){
  try {
    const session=await getServerSession();
    // TODO : replace with id
    if(!session?.user?.email){
      return NextResponse.json({message:"Unauthorised"},{status:403});
    }
    const user= await prismaClient.user.findFirst({
      where:{email:session.user.email}
    })
    if(!user){
      return NextResponse.json({message:"Unauthorised"},{status:403});
    }
    // now upvote
    const data=UpvoteSchema.parse(await req.json());
    await prismaClient.upvote.delete({
      where:{
        userId_streamId:{
          userId:user.id,
          streamId:data.StreamId
        }
      }
    })
  } catch (error) {
    return NextResponse.json({message:"Error in downvote"},{status:411});
  }
}