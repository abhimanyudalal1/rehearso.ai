const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const { UserModel } = require('../models/db')

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      })
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decodedData = jwt.verify(token, JWT_SECRET)
    const userId = decodedData.userId
    const userEmail = decodedData.email

    const userFound = await UserModel.findById(userId)

    if (!userFound) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      })
    }

    // Add user info to request object
    req.user = {
      id: userId,
      email: userEmail,
      name: userFound.name
    }
    
    next()
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
      error: error.message
    })
  }
}

module.exports = authMiddleware;