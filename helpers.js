const getUserByEmail = function(email, database) {
  // lookup magic...
  let u=0;
  for (let item in database){
    if(database[item].email===email){
      u=database[item].id;
    }
  }
  if(u===0){
    return null;
  }
  return u;
};
module.exports = { getUserByEmail }