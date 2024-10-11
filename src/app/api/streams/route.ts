import { getVideoId, isValidYoutubeUrl } from "@/helpers/youtube";
import  prisma  from "@/lib/db";
import { CreateStreamSchema } from "@/schemas/CreateStreamSchema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

export const dynamic = 'force-dynamic'

export async function POST(req:NextRequest){
  try {
    const data=CreateStreamSchema.parse(await req.json());

    const session=await getServerSession();
    // TODO get rid off db call, use cookie
    if(!session?.user?.email){
      return NextResponse.json({message:"Unauthorised"},{status:203});
    }

    const currUser= await prisma.user.findFirst({
      where:{
        email:session.user.email
      }
    })

    const streamsAddedByUser=await prisma.stream.count({
      where:{
        userId:data.creatorId,
        addedById:currUser?.id,
        played:false
      }
    })

    if(streamsAddedByUser>=2){
      return NextResponse.json({message:"Limit reached!! You cant add more than 2 videos"},{status:202});
    }

    const isYt=isValidYoutubeUrl(data.url);
    if(!isYt){
      return NextResponse.json({message:"Wrong url format"},{status:412});
    }
    const extractedId=getVideoId(data.url);

    // now fetch video's details
    const res=await youtubesearchapi.GetVideoDetails(extractedId);
    const thumbnails=res.thumbnail.thumbnails;
    thumbnails.sort((a:{width:number},b:{width:number})=> a.width<b.width?-1:1);
    const defaultThumbnail="https://shorturl.at/kD7Wy";

    const stream=await prisma.stream.create({
      data:{
        userId:data.creatorId,
        url:data.url,
        extractedId,
        addedById:currUser?.id ?? "",
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


export async function GET(req:NextRequest){
  try {
    const session=await getServerSession();
    // TODO get rid off db call, use cookie
    if(!session?.user?.email){
      return NextResponse.json({message:"Unauthorised"},{status:203});
    }
    const user= await prisma.user.findFirst({
      where:{email:session.user.email}
    })
    if(!user){
      return NextResponse.json({message:"Unauthorised"},{status:404});
    }
    const creatorId=req.nextUrl.searchParams.get("creatorId");
    if(!creatorId){
      return NextResponse.json({message:"No creatorId"},{status:411});
    }
    const [streams,activeStream]= await Promise.all([
      prisma.stream.findMany({
        where:{
          userId:creatorId,
          played:false
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
      }),
      prisma.currentStream.findMany({
        where:{
          userId:creatorId
        },
        include:{
          Stream:true
        }
      })
    ])

    // console.log(
    //   {
    //     streams:streams.map(({_count,...rest})=>({
    //       ...rest,
    //       upvotes:_count.upvotes,
    //       hasUpvoted:rest.upvotes.length>0 ? true : false
    //     })),
    //     activeStream
    //   }
    // )

    return NextResponse.json({
      streams:streams.map(({_count,...rest})=>({
        ...rest,
        upvotes:_count.upvotes,
        hasUpvoted:rest.upvotes.length>0 ? true : false
      }))
    ,activeStream
    },{status:200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({message:"Error getting streams"},{status:402})
  }
}


// export async function GET(req:NextRequest,res:NextResponse){
//   try {
//     const creatorId=req.nextUrl.searchParams.get("creatorId");
//     const streams=await prisma.stream.findMany({
//       where:{
//         userId:creatorId??""
//       }
//     })
//     return NextResponse.json({streams},{status:200});
//   } catch (error) {
//     return NextResponse.json({message:"Error while getting streams"},{status:411});
//   }
// }