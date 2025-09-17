export const camelToUnderscore=(str:string)=> {
  return str.replace(/[A-Z]/g, function(match) {
      return "_" + match.toLowerCase();
  });
}