const express = require ("express");
const router = express.Router();

//index Route  - users 
router.get("/", (req, res) => {
    res.send("get for users");
});

// Show - users 
router.get("/:id", (Req, res) => {
    res.send("Get  for  user id ");
});


// Post - users 
router.post("/", (Req, res) => {
    res.send("Post  for users");
});

// Delete - users 
router.delete("/:id", (Req, res) => {
    res.send("Delete  for users");
});


module.exports = router;