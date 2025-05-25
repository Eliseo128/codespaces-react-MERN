import { createContext, useContext , useState} from "react";
import { getTasksRequest, deleteTaskRequest , createTaskRequest , getTaskRequest , updateTaskRequest , toogleTaskRequest} from "../api/tasks.api";

export const TaskContext = createContext()

export const useTask = () => {
    const context = useContext(TaskContext)
    if(!context){
        throw new Error("useTask not is in context")
    }
    return context
}

export const TaskContextProvider = ({children}) =>{

    const [tasks,setTask] = useState([])

    async function loadTask(){
        const response = await getTasksRequest()
        setTask(response.data)
      }
    
    const deleteTask = async (id) => {
        try {
            const response = await deleteTaskRequest(id)
            setTask(tasks.filter(task=>task.id !== id))
        } catch (error) {
            console.error(error)
        }
        
    }
    const createTask = async (values) => {
        try {
            const response = await createTaskRequest(values)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const getTask = async (id) => {
        try {
            const response = await getTaskRequest(id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const updateTask = async (id,newFields) => {
        try {
            const response = await updateTaskRequest(id,newFields)
            return response
        } catch (error) {
            console.error(error)
        }
    }

    const toogleTaskDone = async (id) => {
        try {
            const taskfound = tasks.find(task => task.id === id)
            const response = await toogleTaskRequest(id,taskfound.done === false ? true : false)  
            setTask(
                tasks.map((task) => 
                    task.id === id ? {...task,done: !task.done } : task)
            )
        } catch (error) {
            console.error(error)
        }
    }

    return (
    <TaskContext.Provider value={{tasks,loadTask,deleteTask,createTask,getTask,updateTask,toogleTaskDone}}>
        {children}
    </TaskContext.Provider>
)}