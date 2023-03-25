import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { response } from "express";
import bcrypt from "bcrypt";

// dotenv.config()

const app = express();

app.use(express.json());

const PORT = 5000;

const MONGO_URL = "mongodb://127.0.0.1";

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MongoDB is connected to server 😎😍");
  return client;
}
const client = await createConnection();

async function createPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}

app.get("/", (request, response) => {
  response.send("Welcome to zen Login");
});

////  SignUp data for Mentor Login registration.

app.post("/AdminData/signUp", async (request, response) => {
  const { name, email, contact, password, permission, id, surName } =
    request.body;

  const hashPassword = await createPassword(password);
  console.log(hashPassword);
  const newUser = {
    name: name,
    surName: surName,
    password: hashPassword,
    email: email,
    contact: contact,
    permission: permission,
    id: id,
  };

  const adminSignUp = await client
    .db("zen_task")
    .collection("signUp")
    .insertOne(newUser);

  response.send(adminSignUp);
});

////  SignIn data for Mentor Login

app.post("/AdminData/signin", async (request, response) => {
  const { username, password } = request.body;

  const signIn = await client
    .db("zen_task")
    .collection("signUp")
    .findOne(username);
  if (!signIn) {
    response.status(401).send({ message: "Invalid credintials" });
    console.log({ message: "Invalid credintials" });
  } else {
    const storedPassword = signIn.password;
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    console.log("isPasswordMatch", isPasswordMatch);  //// Returns a boolean value
    if (!isPasswordMatch) {
      response.status(401).send({ message: "invalid credentials" });
    } else {
      response.send("successful login");
    }
  }
});

app.listen(PORT, () => console.log(`app connected to port${PORT} 😎😊`));
