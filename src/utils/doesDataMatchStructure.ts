import structureGenerator from "./generateDataStructure";

export const doesDataMatchStructure = (data: any, structure: any) =>{
  let structureKeys = Object.keys(structure);
  let dataStructure = structureGenerator(data);
  let dataStructureKeys = Object.keys(dataStructure);
  let result = true;

  if(dataStructureKeys.length !== structureKeys.length){
    result = false;
  }
  for (let i = 0; i < structureKeys.length; i++) {
    if(!structureKeys.includes(dataStructureKeys[i])){
      result = false;
    }else if(dataStructure[structureKeys[i]] !== structure[structureKeys[i]]){
      result = false;
    }
  }

  return result
}