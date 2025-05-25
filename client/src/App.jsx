import { Route, Routes } from "react-router-dom"
import { TaskPage} from "./pages/task"
import { TaskForm } from "./pages/taskForm"
import { NotFound } from "./pages/notFound"
import { Navbar } from "./components/Navbar"
import { TaskContextProvider } from "./context/Taskcontext"


function App() {
  return (
    <>
      <TaskContextProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<TaskPage />} />
        <Route path="/new" element={<TaskForm />} />
        <Route path="/edit/:id" element={<TaskForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </TaskContextProvider>
    </>
    
  )
}

export default App