
const deriveDataType = (value: any)=>{
  let result: any = typeof(value);
  if(result === "object"){
    if(Array.isArray(value)){
      result = "array";
    }
  }
  return result;
}

const structureGenerator = (data: any) =>{
  let dataKeys = Object.keys(data);
  let structure: any = {}

  for (let i = 0; i < dataKeys.length; i++) {
    structure[dataKeys[i]] = deriveDataType(data[dataKeys[i]]);
  }

  return structure
}

export default structureGenerator;