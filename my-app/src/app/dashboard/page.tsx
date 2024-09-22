import StreamView from "@/components/StreamView";

const creatorId="2cdfdff6-f498-4a6f-81fa-64689e2c484d";

function page() {
  return <StreamView creatorId={creatorId} playVideo={true} />
}

export default page;
