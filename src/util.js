const zipElement = function(firstElement,list,secondElement){
  list.push([firstElement,secondElement]);
  return list;
}

const zipArray = function(listToZip, list, valueToZipWithList) {
  let zip = zipElement.bind(null,valueToZipWithList); 
  return listToZip.reduce(zip, list);
}

const getCombination = function(firstList, secondList) {
  let zipList = zipArray.bind(null,secondList)
  return firstList.reduce(zipList,[]);
}

module.exports = { zipElement,
  zipArray,
  getCombination };
