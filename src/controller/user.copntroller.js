import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getTasks=async(req,res)=>{
    try {
        const tasks = await prisma.tasks.findMany()
        res.json(tasks)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}

export const postTask=async(req,res)=>{
    try {
        const newTask = await prisma.tasks.create({
        data:req.body,
        })
        res.json(newTask)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}

export const patchTask=async(req,res)=>{
    try {
        const updateTask = await prisma.tasks.update({
            where:{
                id:parseInt(req.params.id),
            },
            data:req.body
        })
        return res.json(updateTask)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}

export const deleteTask=async(req,res)=>{
    try {
        const deleteTask = await prisma.tasks.delete({
        where:{
            id:parseInt(req.params.id)
            }
        })

        if(!deleteTask){return res.status(404).json({error:"task not found"})}
        return res.json(deleteTask)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}

export const getTask=async(req,res)=>{
    try {
        const task = await prisma.tasks.findFirst({
        where: {
            id:parseInt(req.params.id)
        }
        })
        if(!task){return res.json({message:"task not found"})}
        return res.json(task)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
    
}