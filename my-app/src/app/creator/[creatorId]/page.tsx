import StreamView from '@/components/StreamView';
import React from 'react'

function page({params}:any) {
  const {creatorId}=params;

  return <StreamView creatorId={creatorId} playVideo={false} />
}

export default page;
