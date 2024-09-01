import { prismaClient } from "@/lib/db";
import { CreateStreamSchema } from "@/schemas/CreateStreamSchema";
import { NextRequest, NextResponse } from "next/server";

const YT_REGEX=/^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export async function POST(req:NextRequest,res:NextRequest){
  try {
    const data=CreateStreamSchema.parse(await req.json());

    const isYt=data.url.match(YT_REGEX);
    console.log(isYt)
    if(!isYt){
      return NextResponse.json({message:"Wrong url format"},{status:412});
    }
    const match=YT_REGEX.exec(data.url);
    const extractedId=match?match[1]:"";

    const stream=await prismaClient.stream.create({
      data:{
        userId:data.creatorId,
        url:data.url,
        extractedId,
        type:"Youtube"
      }
    });
    return NextResponse.json({message:"Stream added successfully",extractedId,id:stream.id},{status:201});
  } catch (error) {
    return NextResponse.json({message:"Error while adding stream"},{status:401});
  }
}


export async function GET(req:NextRequest,res:NextResponse){
  try {
    const creatorId=req.nextUrl.searchParams.get("creatorId");
    const streams=await prismaClient.stream.findMany({
      where:{
        userId:creatorId??""
      }
    })
    return NextResponse.json({streams},{status:200});
  } catch (error) {
    return NextResponse.json({message:"Error while getting streams"},{status:411});
  }
}