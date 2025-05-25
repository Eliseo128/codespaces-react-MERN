import { Router } from "express";
import { deleteTask, getTask, getTasks, patchTask, postTask } from "../controller/user.copntroller.js";

const routs = Router() 

routs.get('/',getTasks)

routs.get('/:id',getTask)

routs.post('/',postTask)

routs.patch('/:id',patchTask)

routs.delete('/:id',deleteTask)

export default routs
