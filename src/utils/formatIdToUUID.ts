
export default function formatIdToUuid(id: string){
  if(!id){
    return ""
  }
  let arr = [];
  arr.push(id.substring(0, 8));
  arr.push("-")
  arr.push(id.substring(8, 12));
  arr.push("-")
  arr.push(id.substring(12, 16));
  arr.push("-")
  arr.push(id.substring(16, 20));
  arr.push("-")
  arr.push(id.substring(20, 32));

  return arr.join("")
}