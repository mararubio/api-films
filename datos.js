import dotenv from "dotenv"; // Importar variables de entorno
dotenv.config();

// Importar BD
import { MongoClient, ObjectId } from "mongodb";

export function connectMongo(){
    return MongoClient.connect(process.env.MONGO_URL)
}

export function findUser(user){ // Buscar Usuario
    return new Promise((ok,ko) => {
        let dbConnect = null;
        connectMongo()
        .then( dbconnectPromise => {
            dbConnect = dbconnectPromise;
            let collect = dbConnect.db("films").collection("users");
            return collect.findOne({ user })
        })
        .then( user => {
            dbConnect.close();
            ok(user);
        })
        .catch( error => {
            if(dbConnect){
                dbConnect.close();
            }
            ko({ error : "error en la base de datos" })
        });
    });
}

export function findFilms(user){ // Buscar peliculas
    return new Promise((ok,ko) => {
        let dbConnect = null;
        connectMongo()
        .then( dbconnectPromise => {
            dbConnect = dbconnectPromise;
            let collect = dbConnect.db("films").collection("films");
            return collect.find({ user }).toArray()
        })
        .then( films => {
            dbConnect.close();
            ok(films);
        })
        .catch( error => {
            if(dbConnect){
                dbConnect.close();
            }
            ko({ error : "error en la base de datos"})
        });
    });
}

export function createFilm(film){ // Crear peliculas con { usuario,título,reseña,valoración }
    return new Promise((ok,ko) => {
        let dbConnect = null;
        connectMongo()
        .then( dbconnectPromise => {
            dbConnect = dbconnectPromise;
            let collect = dbConnect.db("films").collection("films");
            return collect.insertOne(film)
        })
        .then( ({insertedId}) => {
            dbConnect.close();
            ok(insertedId);
        })
        .catch( error => {
            if(dbConnect){
                dbConnect.close();
            }
            ko({ error : "error en la base de datos" })
        });
    });
}

export function deleteFilm(id){ // Eliminar película
    return new Promise((ok,ko) => {
        let dbConnect = null;
        connectMongo()
        .then( dbconnectPromise => {
            dbConnect = dbconnectPromise;
            let collect = dbConnect.db("films").collection("films");
            return collect.deleteOne({ _id : new ObjectId(id) });
        })
        .then(({deletedCount}) => {
            dbConnect.close();
            ok(deletedCount)
        })
        .catch(error => {
            if(dbConnect){
                dbConnect.close();
            }
            ko({ error : "error en al base de datos" })
        })
    })
}

export function updateFilm(id,film){ // Actualizar película
    return new Promise((ok,ko) => {
        let dbConnect = null;
        connectMongo()
        .then( dbconnectPromise => {
            dbConnect = dbconnectPromise;
            let collect = dbConnect.db("films").collection("films");
            return collect.updateOne({_id : new ObjectId(id)},{$set : film})
        })
        .then( film => {
            dbConnect.close();
            ok(film);
        })
        .catch( error => {
            if(dbConnect){
                dbConnect.close();
            }
            ko({ error : "error en al base de datos" })
        });
    })
}





