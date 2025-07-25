import dotenv from "dotenv"; // Importamos variables de entorno
dotenv.config();

// Importar dependencias
import express from "express"; // Middlewares
import cors from "cors"; // Peticiones desde otro dominio
import bcrypt from "bcrypt"; // Encriptar contraseña
import jwt from "jsonwebtoken"; // Token

// Importamos funciones de ./datos
import { findUser,findFilms,createFilm,deleteFilm,updateFilm } from "./datos.js";

function tokenGenerate(user){ // Nombre de usuario
    return jwt.sign({user}, process.env.SECRET) // Creamos el token, en este caso no haremos que caduque (no usaremos REFRESH)
}

function authorize(req,res,next){
    let token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined; // Extraemos el token
    if(!token){
        return res.status(401).json({ error: "Token no proporcionado" });// Unauthorized error
    }
    jwt.verify(token,process.env.SECRET,(error,data) => { // Verifica
        if(!error){
            req.user = data.user;
            return next();
        }
        res.status(403).json({ error: "Token inválido o expirado" }); // Forbidden
    });
}

const server = express(); // Middlewares

server.use(cors()); // Middleware gobal - Hacer peticiones desde otro dominio.

server.use(express.json()); // Lo necesito para req.body.


//Middleware login
server.post("/login", async (req,res) => {
    let { user,password } = req.body; 
    if(!user || !password){
        return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }
    try { // Si existe el usuario
        let posibleUser = await findUser(user);
        if(!posibleUser){
            return res.status(401).json({ error: "Usuario no encontrado" }); // Unauthorized error
        }
        let valid = await bcrypt.compare(password, posibleUser.password); 
        if(!valid){ // Si la contraseña es correcta.
            return res.status(403).json({ error: "Contraseña incorrecta" }); // Forbidden
        }
        res.status(200).json({ token : tokenGenerate(user) });

    }catch(error){
        res.status(500).json({ error : "error en el servidor" });
    }
});

//Middleware mostras pelis
server.get("/films", authorize, async (req,res) =>{
   try{
    let films = await findFilms(req.user); // Ver solo las películas del usuario.
    
    res.status(200).json(films);

   }catch(error){
    res.status(500).json({ error : "error en el servidor"})
   }
});

//Middleware crear pelis
server.post("/films/new", authorize, async (req,res,next) => {
    let { titulo, reseña, valoracion } = req.body;
    if(!titulo || !reseña || !valoracion){
        return res.status(400).json({ error : "Faltan datos"})
    }
    try{

        let user = req.user
        let id = await createFilm({user,titulo,reseña,valoracion});
        res.status(201).json(id);
    }catch(error){
       res.status(500).json({ error : "error en el servidor" })
    }
});

//Middleware eliminar pelis
server.delete("/films/delete/:id", authorize, async (req,res) => {
    let { id } = req.params;

    if(!id){
        return res.status(400).json({ error : " No hay ID"})
    }
    try{
        let cantidad = await deleteFilm(id);
        res.sendStatus(204);

    }catch(error){
        res.status(500).json({ error : "error en el servidor" })
    }
})

//Middleware editar pelis
server.put("/films/update/:id", authorize, async (req,res) => {
    let  film  = req.body; 
    let { id } = req.params;
    try{
        let cantidad = await updateFilm(id,film);
       
        res.sendStatus(204);

    }catch(error){
        res.status(500).json({ error : "error en el servidor" })
    }

})

//Middleware errores
server.use((error,req,res,next) => {
    res.status(500).json({ error : "error en la petición" });
})

//Middleware rutas no encontradas
server.use((req,res) => {
    res.status(404).json({ error : "recurso no encontrado" });
});

server.listen(process.env.PORT);
