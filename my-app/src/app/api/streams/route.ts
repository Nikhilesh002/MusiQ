import { getVideoId, isValidYoutubeUrl } from "@/helpers/youtube";
import { prismaClient } from "@/lib/db";
import { CreateStreamSchema } from "@/schemas/CreateStreamSchema";
import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

export async function POST(req:NextRequest,res:NextResponse){
  try {
    const data=CreateStreamSchema.parse(await req.json());
    console.log(data)

    const isYt=isValidYoutubeUrl(data.url);
    if(!isYt){
      return NextResponse.json({message:"Wrong url format"},{status:412});
    }
    const extractedId=getVideoId(data.url);

    // now fetch video's details
    const res=await youtubesearchapi.GetVideoDetails(extractedId);
    const thumbnails=res.thumbnail.thumbnails;
    const defaultThumbnail="https://shorturl.at/kD7Wy";

    const stream=await prismaClient.stream.create({
      data:{
        userId:data.creatorId,
        url:data.url,
        extractedId,
        type:"Youtube",
        title:res.title??"Can't find title",
        bigImage:thumbnails.length>0 ? thumbnails[thumbnails.length-1].url :"",
        smallImage: thumbnails.length>1 ? thumbnails[thumbnails.length-2].url : (thumbnails.length>0 ? thumbnails[thumbnails.length-1].url :"")
      }
    });
    return NextResponse.json({
      message:"Stream added successfully",
      extractedId,
      id:stream.id,
      title:res.title??"Can't find title",
      bigImage:thumbnails.length>0 ? thumbnails[thumbnails.length-1].url :defaultThumbnail,
      smallImage: thumbnails.length>1 ? thumbnails[thumbnails.length-2].url : (thumbnails.length>0 ? thumbnails[thumbnails.length-1].url :defaultThumbnail),
      hasUpvoted:false,
      upvotes:0
    },{status:201});
  } catch (error) {
    return NextResponse.json({message:"Error while adding stream"},{status:411});
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