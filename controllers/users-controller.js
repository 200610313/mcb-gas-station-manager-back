const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sql = require("../models/db");
const Employee = require("../models/Employee");

exports.registerUser = async (req, res, next) => {
  try {
    const { uName, password, lName, mInit, fName, nickName } = req.body;
    const token = jwt.sign({ id: uName }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
    const user = new User({ uName, password });
    await User.create(user);
    const employee = await Employee.create({
      lName,
      mInit,
      fName,
      nickName,
      uName,
    });
    res.status(200).json({ uName, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};
