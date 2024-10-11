const YT_REGEX=/^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export function isValidYoutubeUrl(url:string){
  const isYt=url.match(YT_REGEX);
  return isYt;
}

export function getVideoId(url:string){
  const match=YT_REGEX.exec(url);
  return match && match[1].length===11?match[1]:"";
}