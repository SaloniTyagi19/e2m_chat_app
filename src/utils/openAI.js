import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` });

const callAPi = async (content) => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content }],
            model: 'gpt-3.5-turbo',
        })
        return completion.choices[0] || 'No data found'
    } catch (error) {
        console.log('Error while fetchinf=g', error)
        return {message: 'No data'}
    }
}

export default callAPi