import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest,res:NextResponse){
  try {
    const session=await getServerSession();
    // TODO : replace with id
    // TODO : get rid off db call
    if(!session?.user?.email){
      return NextResponse.json({message:"Unauthorised"},{status:401});
    }
    const user= await prismaClient.user.findFirst({
      where:{email:session.user.email}
    })
    if(!user){
      return NextResponse.json({message:"Unauthorised"},{status:404});
    }
    const streams=await prismaClient.stream.findMany({
      where:{
        userId:user.id??""
      },
      include:{
        _count:{
          select:{
            upvotes:true
          }
        },
        upvotes:{
          where:{
            userId:user.id
          }
        }
      }
    })
    return NextResponse.json({
      streams:streams.map(({_count,...rest})=>({
        ...rest,
        upvotes:_count.upvotes,
        hasUpvoted:rest.upvotes.length>0 ? true : false
      }))
    },{status:200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({message:"Error getting streams"},{status:402})
  }
}