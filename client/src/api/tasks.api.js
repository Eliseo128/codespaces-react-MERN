import axios from "axios"

export const getTasksRequest = async () => {
    return axios.get("http://localhost:3000/api")
}

export const createTaskRequest = async (task) => {
    return axios.post("http://localhost:3000/api",task)
}

export const deleteTaskRequest = async (id) => {
    return axios.delete(`http://localhost:3000/api/${id}`)
}

export const getTaskRequest = async (id) => {
    return axios.get(`http://localhost:3000/api/${id}`)
}

export const updateTaskRequest = async (id,newFields) => {
    return axios.patch(`http://localhost:3000/api/${id}`,newFields)
}

export const toogleTaskRequest = async (id, done) => {
    return axios.patch(`http://localhost:3000/api/${id}`,{
        done,
    })
}

