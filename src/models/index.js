const mongoose = require('mongoose') 

export const StudentSchema = mongoose.connection.collection('students')
export const VideoSchema = mongoose.connection.collection('videos')