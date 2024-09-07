'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { ChevronDown, ChevronUp, Play, Plus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getVideoId, isValidYoutubeUrl } from '@/helpers/youtube'

const REFERESH_TIMEINTERVAL_MS= 100 * 1000;

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

export default function SongVotingPage() {
  const [videoQueue, setVideoQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

  const refreshStreams= async () => {
    const res=await axios.get('/api/streams/my')
    console.log(res.data.streams)
    setVideoQueue(res.data.streams);
  }

  useEffect(() => {
    refreshStreams();
    setInterval(()=>{
      refreshStreams();
    },REFERESH_TIMEINTERVAL_MS);

    // Load the YouTube IFrame API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  // TODO get from db
  const addToQueue = async (e:any) => {
    e.preventDefault();
    const videoUrl=e.target.url.value
    e.target.url.value=""
    if(!isValidYoutubeUrl(videoUrl)){
      toast.error("Enter valid url");
      return;
    }
    // const videoId = getVideoId(videoUrl);
    try {
      const res = await axios.post("/api/streams",{
        creatorId:"49f96001-52db-4bba-9047-0d5a46602b45",
        url:videoUrl
      })
      console.log(res.data)
      setVideoQueue([...videoQueue, res.data]);
    } catch (error) {
      console.error('Error fetching video details:', error)
    }
  }

  const handleVote =async (index: number,type:"upvote"|"downvote") => {
    console.log(type)
    const newQueue = [...videoQueue]
    const res=await axios.post(`/api/streams/${type}`,{streamId:newQueue[index].id});
    console.log(res)

    if(res.status===200){
      newQueue[index].hasUpvoted= type==="downvote" ? false : true ;
      newQueue[index].upvotes += type==="downvote" ? -1 : 1 ;
      toast.success(res.data.message)
    }
    newQueue.sort((a, b) => b.upvotes  - a.upvotes)
    setVideoQueue(newQueue)
  }

  const playNext = () => {
    if (videoQueue.length > 0) {
      setCurrentVideo(videoQueue[0])
      setVideoQueue(videoQueue.slice(1))
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Song Voting System</h1>
      
      <form action="" onSubmit={addToQueue}>
        <div className="space-y-4">
          <Input
            name="url"
            type="text"
            placeholder="Enter YouTube video URL"
          />
          <Button type='submit'>
            <Plus className="mr-2 h-4 w-4" /> Add to Queue
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Now Playing</h2>
        {currentVideo ? (
          <div className='w-full'>
            <h3 className="font-semibold mb-2">{currentVideo.title}</h3>
            <div className="aspect-video w-1/2 mx-auto">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo.extractedId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : (
          <p>No video currently playing</p>
        )}
        <Button onClick={playNext}>
          <Play className="mr-2 h-4 w-4" /> Play Next
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Songs</h2>
        {videoQueue.map((video, index) => (
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
