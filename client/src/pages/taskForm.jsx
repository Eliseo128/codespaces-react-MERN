import { Form, Formik } from "formik"
import { useTask } from "../context/Taskcontext"
import { useParams , useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"


export function TaskForm() {

  const { createTask , getTask , updateTask} = useTask()
  const [task,setTask] = useState({
      tittle:"",
      description:""
  })
  const params = useParams()
  const navigate = useNavigate()

  useEffect(()=>{
    const loadTask = async()=>{
      if(params.id){
        const task = await getTask(params.id)
        setTask({
          tittle:task.tittle,
          description:task.description
        })
      }
    }
    loadTask()
  },[])

  return (
    <div>
      <h1>{ params.id ? "Edit Task" : "New Task"}</h1>
        <Formik
          initialValues={task}
          enableReinitialize={true}
          onSubmit={async(values,actions)=>{
            if(params.id){
              await updateTask(params.id,values)
            }else{
              await createTask(values)
            }
            navigate(("/"))
            setTask({
              tittle:"",
              description:""
            })
            actions.resetForm()
          }}>
            
          {({handleChange,handleSubmit,values,isSubmitting})=>(
            <Form onSubmit={handleSubmit}>

            <label>tittle</label>
            <input 
              type="text" 
              name="tittle" 
              placeholder="Write a tittle" 
              onChange={handleChange}
              value={values.tittle}
            />

            <label>description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Write a description"
              onChange={handleChange}
              value={values.description}
              ></textarea>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving.." : "save"}
            </button>
          </Form>
          )}      
        </Formik>
    </div>
  )
}