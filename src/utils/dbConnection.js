import mongoose from 'mongoose'
const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

export default dbConnection