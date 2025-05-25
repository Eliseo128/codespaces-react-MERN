import express from 'express'
import routs from './routes/index.routes.js'
import cors from 'cors'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use('/api',routs)

app.listen(PORT,()=>{
    console.log('Server on 3000')
})


