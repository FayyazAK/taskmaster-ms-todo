const express = require("express");
const router = express.Router();
const {
  createList,
  getUserLists,
  getListById,
  deleteList,
  deleteAllLists,
  updateList,
  cleanUpList,
  cleanUpAllLists,
} = require("../controllers/listController");

router.post("/", createList);
router.get("/", getUserLists);
router.delete("/", deleteAllLists);
router.delete("/clear", cleanUpAllLists);

router.get("/:list_id", getListById);
router.put("/:list_id", updateList);
router.delete("/:list_id", deleteList);
router.delete("/:list_id/clear", cleanUpList);

module.exports = router;
