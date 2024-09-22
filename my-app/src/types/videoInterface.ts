export interface IVideo {
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