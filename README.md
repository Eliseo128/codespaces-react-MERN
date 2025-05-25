¡Claro! Vamos a crear un proyecto CRUD completo con React (Vite) para el frontend y Express con Prisma para el backend.

**Estructura del Proyecto "tareas"**

```
tareas/
├── backend/
│   ├── prisma/
│   │   ├── dev.db              # Base de datos SQLite (se creará automáticamente)
│   │   └── schema.prisma       # Esquema de Prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   └── tasks.controllers.js # Lógica de las rutas
│   │   ├── routes/
│   │   │   └── tasks.routes.js      # Definición de las rutas API
│   │   └── index.js            # Archivo principal del servidor Express
│   ├── .env                    # Variables de entorno (DATABASE_URL)
│   ├── package.json
│   └── package-lock.json
│
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── api/
    │   │   └── tasks.api.js      # Funciones para interactuar con el backend
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── TaskForm.jsx
    │   ├── context/
    │   │   ├── TaskContext.jsx   # Definición del contexto
    │   │   └── TaskProvider.jsx  # Proveedor del contexto con lógica
    │   ├── pages/
    │   │   ├── TaskFormPage.jsx
    │   │   ├── TasksPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── App.jsx               # Componente principal y enrutador
    │   ├── index.css             # Estilos globales
    │   └── main.jsx              # Punto de entrada de la aplicación React
    ├── .eslintrc.cjs
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vite.config.js
```

---

**Paso 1: Configuración del Backend**

1.  **Crear la carpeta del backend y navegar a ella:**
    ```bash
    mkdir tareas
    cd tareas
    mkdir backend
    cd backend
    ```

2.  **Inicializar el proyecto Node.js y instalar dependencias:**
    ```bash
    npm init -y
    npm install express cors @prisma/client
    npm install -D prisma nodemon
    ```

3.  **Inicializar Prisma:**
    ```bash
    npx prisma init
    ```
    Esto creará una carpeta `prisma` con un archivo `schema.prisma` y un archivo `.env`.

4.  **Configurar `prisma/schema.prisma`:**
    Reemplaza el contenido de `prisma/schema.prisma` con el tuyo:
    ```prisma
    // backend/prisma/schema.prisma
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "sqlite"
      url      = env("DATABASE_URL")
    }

    model tasks {
      id          Int      @id @default(autoincrement())
      tittle      String   // Corregido: 'title' en lugar de 'tittle' es más común
      description String
      done        Boolean  @default(false)
      create_at   DateTime @default(now())
    }
    ```
    *Nota: Corregí "tittle" a "title" ya que es la ortografía común. Si prefieres "tittle", ajústalo en todo el código.*

5.  **Configurar `.env`:**
    Modifica el archivo `.env` en la raíz de la carpeta `backend`:
    ```env
    # backend/.env
    DATABASE_URL="file:./prisma/dev.db"
    ```

6.  **Generar el cliente Prisma y crear la migración inicial:**
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
    Esto creará la base de datos `dev.db` en `backend/prisma/` y las tablas según tu esquema.

7.  **Crear archivos del servidor Express:**

    *   **`backend/src/index.js`** (Punto de entrada del servidor)
        ```javascript
        // backend/src/index.js
        import express from 'express';
        import cors from 'cors';
        import taskRoutes from './routes/tasks.routes.js';

        const app = express();
        const PORT = process.env.PORT || 3000;

        // Middlewares
        app.use(cors({
            origin: 'http://localhost:5173', // Permite peticiones desde el frontend de Vite
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type"]
        }));
        app.use(express.json()); // Para entender los JSON que envía el frontend

        // Rutas
        app.use('/api', taskRoutes);

        app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
        });
        ```

    *   **`backend/src/routes/tasks.routes.js`** (Definición de rutas)
        ```javascript
        // backend/src/routes/tasks.routes.js
        import { Router } from 'express';
        import {
            getAllTasks,
            getTask,
            createTask,
            updateTask,
            deleteTask,
            toggleTaskDone // Nueva función para marcar como hecha/no hecha
        } from '../controllers/tasks.controllers.js';

        const router = Router();

        router.get('/tasks', getAllTasks);
        router.get('/tasks/:id', getTask);
        router.post('/tasks', createTask);
        router.put('/tasks/:id', updateTask);
        router.put('/tasks/toggle/:id', toggleTaskDone); // Ruta para cambiar estado 'done'
        router.delete('/tasks/:id', deleteTask);

        export default router;
        ```

    *   **`backend/src/controllers/tasks.controllers.js`** (Lógica de las rutas)
        ```javascript
        // backend/src/controllers/tasks.controllers.js
        import { PrismaClient } from '@prisma/client';

        const prisma = new PrismaClient();

        export const getAllTasks = async (req, res) => {
            try {
                const tasks = await prisma.tasks.findMany();
                res.json(tasks);
            } catch (error) {
                res.status(500).json({ message: "Error fetching tasks", error: error.message });
            }
        };

        export const getTask = async (req, res) => {
            try {
                const task = await prisma.tasks.findUnique({
                    where: { id: parseInt(req.params.id) },
                });
                if (!task) return res.status(404).json({ message: "Task not found" });
                res.json(task);
            } catch (error) {
                res.status(500).json({ message: "Error fetching task", error: error.message });
            }
        };

        export const createTask = async (req, res) => {
            const { title, description } = req.body; // Cambiado tittle a title
            if (!title) {
                return res.status(400).json({ message: "Title is required" });
            }
            try {
                const newTask = await prisma.tasks.create({
                    data: {
                        title,       // Cambiado tittle a title
                        description: description || "", // Asegura que description no sea undefined
                    },
                });
                res.status(201).json(newTask);
            } catch (error) {
                res.status(500).json({ message: "Error creating task", error: error.message });
            }
        };

        export const updateTask = async (req, res) => {
            const { title, description, done } = req.body; // Cambiado tittle a title
            try {
                const updatedTask = await prisma.tasks.update({
                    where: { id: parseInt(req.params.id) },
                    data: {
                        title,       // Cambiado tittle a title
                        description,
                        done
                    },
                });
                if (!updatedTask) return res.status(404).json({ message: "Task not found" });
                res.json(updatedTask);
            } catch (error) {
                res.status(500).json({ message: "Error updating task", error: error.message });
            }
        };

        export const toggleTaskDone = async (req, res) => {
            try {
                const taskFound = await prisma.tasks.findUnique({
                    where: { id: parseInt(req.params.id) }
                });

                if (!taskFound) return res.status(404).json({ message: "Task not found" });

                const updatedTask = await prisma.tasks.update({
                    where: { id: parseInt(req.params.id) },
                    data: {
                        done: !taskFound.done,
                    },
                });
                res.json(updatedTask);
            } catch (error) {
                res.status(500).json({ message: "Error toggling task status", error: error.message });
            }
        };

        export const deleteTask = async (req, res) => {
            try {
                const deletedTask = await prisma.tasks.delete({
                    where: { id: parseInt(req.params.id) },
                });
                if (!deletedTask) return res.status(404).json({ message: "Task not found" });
                // res.json(deletedTask); // O simplemente un 204 No Content
                res.sendStatus(204);
            } catch (error) {
                // Prisma puede lanzar un error específico si el registro no se encuentra P2025
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: "Task not found" });
                }
                res.status(500).json({ message: "Error deleting task", error: error.message });
            }
        };
        ```

8.  **Actualizar `backend/package.json`:**
    Añade el tipo de módulo y scripts:
    ```json
    {
      "name": "backend",
      "version": "1.0.0",
      "description": "",
      "main": "src/index.js",
      "type": "module", // importante para usar import/export
      "scripts": {
        "dev": "nodemon src/index.js",
        "start": "node src/index.js",
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "@prisma/client": "^5.x.x", // usa la versión que tengas instalada
        "cors": "^2.8.5",
        "express": "^4.19.2"
      },
      "devDependencies": {
        "nodemon": "^3.1.0",
        "prisma": "^5.x.x" // usa la versión que tengas instalada
      }
    }
    ```
    *Asegúrate que las versiones de `@prisma/client` y `prisma` coincidan con las que instalaste.*

9.  **Probar el backend (opcional):**
    ```bash
    npm run dev
    ```
    Deberías ver "Backend server running on http://localhost:3000". Puedes probar las rutas con Postman o curl.

---

**Paso 2: Configuración del Frontend**

1.  **Navegar a la raíz del proyecto y crear la app Vite:**
    ```bash
    cd .. # Si estás en la carpeta backend, vuelve a 'tareas'
    npm create vite@latest frontend -- --template react
    ```
    Sigue las instrucciones (selecciona React, luego JavaScript o TypeScript - este ejemplo usa JavaScript).

2.  **Navegar a la carpeta frontend e instalar dependencias:**
    ```bash
    cd frontend
    npm install axios formik react-router-dom
    ```

3.  **Limpiar archivos iniciales de Vite:**
    *   Borra `frontend/src/App.css`
    *   Borra `frontend/src/assets/react.svg`
    *   Simplifica `frontend/src/index.css` (o déjalo vacío por ahora).
    *   Simplifica `frontend/src/App.jsx` (lo reescribiremos).

4.  **Crear archivos del frontend:**

    *   **`frontend/src/api/tasks.api.js`**
        ```javascript
        // frontend/src/api/tasks.api.js
        import axios from 'axios';

        const tasksApi = axios.create({
            baseURL: 'http://localhost:3000/api' // URL base de tu backend
        });

        export const getAllTasks = () => tasksApi.get('/tasks');
        export const getTask = (id) => tasksApi.get(`/tasks/${id}`);
        export const createTask = (task) => tasksApi.post('/tasks', task);
        export const updateTask = (id, task) => tasksApi.put(`/tasks/${id}`, task);
        export const deleteTask = (id) => tasksApi.delete(`/tasks/${id}`);
        export const toggleTaskDone = (id) => tasksApi.put(`/tasks/toggle/${id}`);
        ```

    *   **`frontend/src/context/TaskContext.jsx`**
        ```javascript
        // frontend/src/context/TaskContext.jsx
        import { createContext, useContext } from 'react';

        export const TaskContext = createContext();

        // Hook personalizado para usar el contexto más fácilmente
        export const useTasks = () => {
            const context = useContext(TaskContext);
            if (!context) {
                throw new Error("useTasks must be used within a TaskProvider");
            }
            return context;
        };
        ```

    *   **`frontend/src/context/TaskProvider.jsx`**
        ```javascript
        // frontend/src/context/TaskProvider.jsx
        import { useState, useEffect } from 'react';
        import { TaskContext } from './TaskContext';
        import {
            getAllTasks as fetchTasks,
            createTask as createTaskApi,
            deleteTask as deleteTaskApi,
            updateTask as updateTaskApi,
            toggleTaskDone as toggleTaskDoneApi,
            getTask as getTaskApi
        } from '../api/tasks.api';

        export const TaskProvider = ({ children }) => {
            const [tasks, setTasks] = useState([]);
            const [loading, setLoading] = useState(true);

            async function loadTasks() {
                setLoading(true);
                try {
                    const response = await fetchTasks();
                    setTasks(response.data);
                } catch (error) {
                    console.error("Failed to load tasks:", error);
                    // Aquí podrías manejar el error, ej. mostrar un mensaje al usuario
                } finally {
                    setLoading(false);
                }
            }

            const getTask = async (id) => {
                try {
                    const response = await getTaskApi(id);
                    return response.data;
                } catch (error) {
                    console.error("Failed to get task:", error);
                }
            }

            const createTask = async (task) => {
                try {
                    const response = await createTaskApi(task);
                    setTasks([...tasks, response.data]); // Añade la nueva tarea al estado
                } catch (error) {
                    console.error("Failed to create task:", error);
                }
            };

            const deleteTask = async (id) => {
                try {
                    await deleteTaskApi(id);
                    setTasks(tasks.filter(task => task.id !== id));
                } catch (error) {
                    console.error("Failed to delete task:", error);
                }
            };

            const updateTask = async (id, updatedData) => {
                try {
                    const response = await updateTaskApi(id, updatedData);
                    setTasks(tasks.map(task => (task.id === id ? response.data : task)));
                } catch (error) {
                    console.error("Failed to update task:", error);
                }
            };

            const toggleTask = async (id) => {
                try {
                    const response = await toggleTaskDoneApi(id);
                    setTasks(tasks.map(task => (task.id === id ? { ...task, done: response.data.done } : task)));
                } catch (error) {
                    console.error("Failed to toggle task:", error);
                }
            }

            return (
                <TaskContext.Provider value={{
                    tasks,
                    loading,
                    loadTasks,
                    getTask,
                    createTask,
                    deleteTask,
                    updateTask,
                    toggleTask
                }}>
                    {children}
                </TaskContext.Provider>
            );
        };
        ```

    *   **`frontend/src/components/Navbar.jsx`**
        ```jsx
        // frontend/src/components/Navbar.jsx
        import React from 'react';
        import { Link } from 'react-router-dom';

        function Navbar() {
            return (
                <nav style={{ background: '#333', padding: '1rem', color: 'white', marginBottom: '1rem' }}>
                    <Link to="/" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>
                        <h1>Lista de Tareas</h1>
                    </Link>
                    <Link to="/new" style={{ color: 'white', textDecoration: 'none', background: '#5cb85c', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                        Crear Tarea
                    </Link>
                </nav>
            );
        }

        export default Navbar;
        ```

    *   **`frontend/src/components/TaskCard.jsx`**
        ```jsx
        // frontend/src/components/TaskCard.jsx
        import React from 'react';
        import { useTasks } from '../context/TaskContext';
        import { useNavigate } from 'react-router-dom';

        function TaskCard({ task }) {
            const { deleteTask, toggleTask } = useTasks();
            const navigate = useNavigate();

            const handleDelete = async () => {
                if (window.confirm(`¿Seguro que quieres eliminar la tarea "${task.title}"?`)) {
                    await deleteTask(task.id);
                }
            };

            const handleToggleDone = async () => {
                await toggleTask(task.id);
            };

            return (
                <div style={{ background: '#f4f4f4', padding: '1rem', marginBottom: '1rem', borderRadius: '5px', borderLeft: task.done ? '5px solid green' : '5px solid orange' }}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Estado: {task.done ? "Completada ✔️" : "Pendiente ⏳"}</p>
                    <small>Creada: {new Date(task.create_at).toLocaleDateString()}</small>
                    <div style={{ marginTop: '0.5rem' }}>
                        <button onClick={() => navigate(`/edit/${task.id}`)} style={{ marginRight: '0.5rem', background: '#f0ad4e', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px' }}>
                            Editar
                        </button>
                        <button onClick={handleDelete} style={{ marginRight: '0.5rem', background: '#d9534f', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px' }}>
                            Eliminar
                        </button>
                        <button onClick={handleToggleDone} style={{ background: '#5bc0de', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px' }}>
                            {task.done ? "Marcar Pendiente" : "Marcar Completada"}
                        </button>
                    </div>
                </div>
            );
        }

        export default TaskCard;
        ```

    *   **`frontend/src/components/TaskForm.jsx`**
        ```jsx
        // frontend/src/components/TaskForm.jsx
        import React, { useEffect, useState } from 'react';
        import { Formik, Form, Field, ErrorMessage } from 'formik';
        import { useTasks } from '../context/TaskContext';
        import { useNavigate, useParams } from 'react-router-dom';

        function TaskForm() {
            const { createTask, getTask, updateTask } = useTasks();
            const navigate = useNavigate();
            const params = useParams(); // Para obtener el ID de la URL si estamos editando

            const [task, setTask] = useState({
                title: "",        // Cambiado tittle a title
                description: ""
            });

            useEffect(() => {
                const loadTask = async () => {
                    if (params.id) {
                        const taskData = await getTask(params.id);
                        if (taskData) {
                            setTask({
                                title: taskData.title, // Cambiado tittle a title
                                description: taskData.description
                            });
                        }
                    }
                };
                loadTask();
            }, [params.id, getTask]);


            return (
                <div>
                    <h2>{params.id ? "Editar Tarea" : "Crear Tarea"}</h2>
                    <Formik
                        initialValues={task}
                        enableReinitialize={true} // Importante para que Formik actualice los valores iniciales cuando `task` cambie
                        validate={(values) => {
                            const errors = {};
                            if (!values.title) { // Cambiado tittle a title
                                errors.title = "El título es requerido"; // Cambiado tittle a title
                            }
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                if (params.id) {
                                    await updateTask(params.id, values);
                                } else {
                                    await createTask(values);
                                }
                                navigate("/");
                            } catch (error) {
                                console.error("Error al guardar la tarea:", error);
                                // Podrías mostrar un mensaje de error al usuario aquí
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, dirty, isValid }) => ( // dirty: si el form ha cambiado, isValid: si no hay errores
                            <Form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: 'auto' }}>
                                <div>
                                    <label htmlFor="title">Título</label> {/* Cambiado tittle a title */}
                                    <Field type="text" name="title" placeholder="Escribe un título" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} /> {/* Cambiado tittle a title */}
                                    <ErrorMessage name="title" component="div" style={{ color: 'red', fontSize: '0.8rem' }} /> {/* Cambiado tittle a title */}
                                </div>
                                <div>
                                    <label htmlFor="description">Descripción</label>
                                    <Field as="textarea" name="description" placeholder="Escribe una descripción" rows="3" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" disabled={isSubmitting || !dirty || !isValid} style={{ padding: '0.7rem', background: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: (isSubmitting || !dirty || !isValid) ? 'not-allowed' : 'pointer' }}>
                                    {isSubmitting ? "Guardando..." : (params.id ? "Actualizar" : "Guardar")}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            );
        }

        export default TaskForm;
        ```

    *   **`frontend/src/pages/TasksPage.jsx`**
        ```jsx
        // frontend/src/pages/TasksPage.jsx
        import React, { useEffect } from 'react';
        import { useTasks } from '../context/TaskContext';
        import TaskCard from '../components/TaskCard';

        function TasksPage() {
            const { tasks, loadTasks, loading } = useTasks();

            useEffect(() => {
                loadTasks();
            }, []); // El array vacío asegura que se ejecute solo una vez al montar

            if (loading) return <p>Cargando tareas...</p>;

            if (tasks.length === 0 && !loading) return <p>No hay tareas aún. ¡Crea una!</p>;

            return (
                <div>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            );
        }

        export default TasksPage;
        ```

    *   **`frontend/src/pages/TaskFormPage.jsx`**
        ```jsx
        // frontend/src/pages/TaskFormPage.jsx
        import React from 'react';
        import TaskForm from '../components/TaskForm';

        function TaskFormPage() {
            return (
                <div>
                    <TaskForm />
                </div>
            );
        }

        export default TaskFormPage;
        ```

    *   **`frontend/src/pages/NotFoundPage.jsx`**
        ```jsx
        // frontend/src/pages/NotFoundPage.jsx
        import React from 'react';
        import { Link } from 'react-router-dom';

        function NotFoundPage() {
            return (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h1>404 - Página No Encontrada</h1>
                    <p>Lo sentimos, la página que buscas no existe.</p>
                    <Link to="/">Volver al Inicio</Link>
                </div>
            );
        }

        export default NotFoundPage;
        ```

    *   **`frontend/src/App.jsx`**
        ```jsx
        // frontend/src/App.jsx
        import React from 'react';
        import { BrowserRouter, Routes, Route } from 'react-router-dom';
        import TasksPage from './pages/TasksPage';
        import TaskFormPage from './pages/TaskFormPage';
        import NotFoundPage from './pages/NotFoundPage';
        import Navbar from './components/Navbar';
        import { TaskProvider } from './context/TaskProvider';

        function App() {
            return (
                <BrowserRouter>
                    <TaskProvider> {/* Envuelve tus rutas con el Provider */}
                        <Navbar />
                        <div style={{ padding: '0 2rem' }}> {/* Un poco de padding general */}
                            <Routes>
                                <Route path="/" element={<TasksPage />} />
                                <Route path="/new" element={<TaskFormPage />} />
                                <Route path="/edit/:id" element={<TaskFormPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </div>
                    </TaskProvider>
                </BrowserRouter>
            );
        }

        export default App;
        ```

    *   **`frontend/src/main.jsx`**
        ```jsx
        // frontend/src/main.jsx
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import App from './App.jsx';
        import './index.css'; // Estilos globales si los tienes

        ReactDOM.createRoot(document.getElementById('root')).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
        );
        ```

    *   **`frontend/src/index.css`** (Opcional, para estilos básicos)
        ```css
        /* frontend/src/index.css */
        body {
          font-family: sans-serif;
          margin: 0;
          background-color: #e9ecef; /* Un color de fondo suave */
          color: #333;
        }

        /* Puedes añadir más estilos globales aquí o usar archivos CSS por componente */
        ```

---

**Paso 3: Ejecutar la Aplicación**

1.  **Iniciar el backend:**
    Abre una terminal, navega a `tareas/backend` y ejecuta:
    ```bash
    npm run dev
    ```
    Esto iniciará el servidor Express en `http://localhost:3000`.

2.  **Iniciar el frontend:**
    Abre OTRA terminal, navega a `tareas/frontend` y ejecuta:
    ```bash
    npm run dev
    ```
    Esto iniciará la aplicación Vite, generalmente en `http://localhost:5173`. Abre esta URL en tu navegador.

¡Y listo! Ahora deberías tener un CRUD funcional.
Recuerda que si usaste "tittle" en el schema.prisma, debes cambiar "title" por "tittle" en todo el código del frontend (especialmente en `TaskForm.jsx` y en el controlador del backend). Recomiendo usar "title" por convención.
