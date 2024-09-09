import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(){
  try{
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
    const mostUpvotedStream=await prismaClient.stream.findFirst({
      where:{
        userId:user.id,
        played:false
      },
      orderBy:{
        upvotes:{
          _count:'desc'
        }
      }
    })
    console.log("mostUpvotedStream---",mostUpvotedStream);
    if(!mostUpvotedStream){
      return NextResponse.json({message:"No streams"},{status:404});
    }

    const res=await Promise.all([
      prismaClient.currentStream.upsert({
        where:{
          userId:user.id
        },
        update:{
          streamId:mostUpvotedStream.id
        },
        create:{
          userId:user.id,
          streamId:mostUpvotedStream.id
        }
      }),
      prismaClient.stream.update({
        where:{
          id:mostUpvotedStream.id
        },
        data:{
          played:true,
          playedTimestamp:new Date()
        }
      })
    ])

    console.log("res--",res)

    return NextResponse.json({stream:mostUpvotedStream},{status:200});
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({message:"Error in next"},{status:411});
  }
}