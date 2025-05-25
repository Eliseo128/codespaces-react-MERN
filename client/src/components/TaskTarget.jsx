import { useTask } from "../context/Taskcontext"
import { useNavigate } from "react-router-dom"

export function TaskTarget({task}) {

    const {deleteTask,toogleTaskDone} = useTask()
    const navigate = useNavigate()

    const handleDone = async() =>{
        await toogleTaskDone(task.id)
    }

  return (
    <div>
            <h2>{task.tittle}</h2>
            <p>{task.description}</p>
            <span>{task.done == true ? "✅":"❌"}</span>
            <span>{task.create_at}</span>
            <button onClick={()=>deleteTask(task.id)}>Delete</button>
            <button onClick={()=>navigate(`/edit/${task.id}`)}>Edit</button>
            <button onClick={()=>handleDone()}>Toggle Task</button>
        </div>
  )
}