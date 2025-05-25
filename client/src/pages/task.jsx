import { useEffect } from "react"
import { TaskTarget } from "../components/TaskTarget"
import { useTask } from "../context/Taskcontext"

export function TaskPage() {

  const { tasks , loadTask } = useTask()

  useEffect(()=>{
    loadTask()
  },[])

  function renderMain(){
    if (tasks.length === 0) return<h1>Not Task</h1>
    return tasks.map(task =>(
      <TaskTarget task={task} key={task.id}/>
    ))
  }
  return (
    <div>
      <h1>Task</h1>
      {
        renderMain()
      }
    </div>
  )
}
