const express = require ("express");
const router = express.Router();


//index Route  -  
router.get("/", (req, res) => {
    res.send("get for posts");
});

// Show - 
router.get("/:id", (Req, res) => {
    res.send("Get  for  user id ");
});


// Post - 
router.post("/", (Req, res) => {
    res.send("Post  for posts");
});

// Delete - 
router.delete("/:id", (Req, res) => {
    res.send("Delete  for posts");
});

module.exports = router;


