'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { ChevronDown, ChevronUp, Loader2, Play, Plus, Share2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getVideoId, isValidYoutubeUrl } from '@/helpers/youtube'

const REFERESH_TIMEINTERVAL_MS= 10 * 1000;

interface Video {
  id: string
  title: string
  upvotes: number
  type: "Youtube" | "Spotify",
  extractedId: string,
  url: string,
  smallImage: string,
  bigImage: string,
  active: boolean,
  userId: string,
  hasUpvoted:boolean
}

export default function StreamView(
  {creatorId,playVideo=false}:
  {creatorId:string;playVideo:boolean}
) {
  const [videoQueue, setVideoQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [inputUrl,setInputUrl]=useState<string>("");
  const [playNextLoading,setPlayNextLoading]=useState<boolean>(false);
  const videoPlayerRef=useRef();

  const refreshStreams = async () => {
    try {
      const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
      console.log(res.data.streams);
      const videos=res.data.streams;
      videos.sort((a:any, b:any) => b.upvotes  - a.upvotes);
      setVideoQueue(videos);
      setCurrentVideo(res.data.activeStream[0].Stream)
      console.log(res.data.activeStream)
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  useEffect(() => {
    refreshStreams();
    setInterval(()=>{
      refreshStreams();
    },REFERESH_TIMEINTERVAL_MS);
  }, [])

  useEffect(()=>{

    window.onYouTubeIframeAPIReady=()=>{
      console.log("onYouTubeIframeAPIReady got called bruhhh");
      videoPlayerRef.current = new window.YT.Player('player', {
        height: '390',
        width: '640',
        videoId: currentVideo?.extractedId,
        playerVars: {
          'playsinline': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      })
    }

    // Load the YouTube IFrame API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

  },[currentVideo])

  console.log(videoPlayerRef)

  const onPlayerReady=(event:any)=>{
    console.log("start video")
    event.target.playVideo();
  }

  const onPlayerStateChange=(event:any)=>{
    console.log(event.data);
  }

  // TODO get from db
  const addToQueue = async (e:React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputUrl("");
    const videoUrl=e.target.url.value
    e.target.url.value=""
    if(!isValidYoutubeUrl(videoUrl)){
      toast.error("Enter valid url");
      return;
    }
    toast.loading("Adding to queue");
    // const videoId = getVideoId(videoUrl);
    try {
      const res = await axios.post("/api/streams",{
        creatorId:creatorId,
        url:videoUrl
      })
      console.log(res.data)
      toast.remove();
      setVideoQueue([...videoQueue, res.data]);
    } catch (error) {
      console.error('Error fetching video details:', error)
    }
  }

  const handleUrlChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    e.preventDefault();
    const url=e.target.value;
    if(isValidYoutubeUrl(url)){
      setInputUrl(url);
    }
  }

  const handleVote =async (index: number,voteType:"upvote"|"downvote") => {
    console.log(voteType)
    const newQueue = [...videoQueue]
    const res=await axios.post(`/api/streams/${voteType}`,{streamId:newQueue[index].id});
    console.log(res)

    if(res.status===200){
      newQueue[index].hasUpvoted= voteType==="downvote" ? false : true ;
      newQueue[index].upvotes += voteType==="downvote" ? -1 : 1 ;
      toast.success(res.data.message)
    }
    newQueue.sort((a, b) => b.upvotes  - a.upvotes)
    console.log(newQueue)
    setVideoQueue(newQueue)
  }

  const playNext =async () => {
    if (videoQueue.length === 0) {
      toast.error("Add some music into queue")
      return;
    }
    try {
      setPlayNextLoading(true);
      const res=await axios.get("/api/streams/next");
      setCurrentVideo(res.data.stream);
      setVideoQueue(videoQueue.filter(video=>video.id!==res.data.stream.id))
      // setVideoQueue(videoQueue.splice(0,1))
      // console.log("splice->",videoQueue.splice(0,1))
      // console.log(res.data.stream);
    } catch (error) {
      console.error(error);
      toast.error("Error adding into queue");
    } finally{
      setPlayNextLoading(false);
    }
  }

  const copyToClipboard=()=>{
    const url=window.location.host+"/creator/"+creatorId
    toast.success("Copied to clipboard")
    window.navigator.clipboard.writeText(url)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between ps-2">
        <h1 className="text-3xl font-bold mb-6">Song Voting System</h1>
        <Button onClick={copyToClipboard} variant="ghost" className="px-1.5 bg-black text-white"><Share2 className="h-4 w-4 me-1 ms-0.5"/>Share</Button>
      </div>
      
      <form action="" onSubmit={addToQueue}>
        <div className="space-y-4">
          <Input
            name="url"
            type="text"
            onChange={handleUrlChange}
            placeholder="Enter YouTube video URL"
          />
          <Button type='submit'>
            <Plus className="mr-2 h-4 w-4" /> Add to Queue
          </Button>
        </div>
      </form>
      
      {
        inputUrl!=="" && <div className="aspect-video w-1/2 mx-auto">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${getVideoId(inputUrl)}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      }

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Now Playing</h2>
        {currentVideo ? (
          <div className='w-full'>
            <h3 className="font-semibold mb-2">{currentVideo.title}</h3>
            <div className="aspect-video w-1/2 mx-auto">
              {/*<iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo.extractedId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>*/}
              <div className="w-1/2">
                <div id="player"></div>
              </div>
            </div>
          </div>
        ) : (
          <p>No video currently playing</p>
        )}
        {
          playVideo ? 
            <Button disabled={playNextLoading} onClick={playNext}>
                {
                  playNextLoading ? 
                    <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading</> :
                    <><Play className="mr-2 h-4 w-4" /> Play Next</>
                  }
            </Button>
          : null
        }
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {
            videoQueue.length!==0 ? "Upcoming Songs" : "No Upcoming Songs"
          }
        </h2>
        {videoQueue?.map((video, index) => (
          <Card key={video.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Image
                  src={video.smallImage}
                  alt={video.title}
                  width={120}
                  height={90}
                  className="rounded"
                />
                <div>
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-gray-500">ID: {getVideoId(video.url)}</p>
                  <p className='text-xs text-green-400'>Upvotes : {video.upvotes}</p>
                </div>
              </div>
              <div className="">
                <Button variant="outline" className='flex gap-2 px-0.5' size="icon" onClick={() => handleVote(index,video.hasUpvoted?"downvote":"upvote")}>
                  {
                    video.hasUpvoted ?
                    <ChevronDown className={`transition-transform duration-300 ease-in-out transform ${video.hasUpvoted ? 'scale-110' : 'scale-100'} h-6 w-6 text-red-500 bg-red-100 p-1 rounded-md`} /> :
                    <ChevronUp className={`transition-transform duration-300 ease-in-out transform ${!video.hasUpvoted ? 'scale-110' : 'scale-100'} h-6 w-6 text-green-500 bg-green-100 p-1 rounded-md`} />
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
