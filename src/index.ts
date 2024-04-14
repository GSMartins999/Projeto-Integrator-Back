import express, { Request, Response} from 'express';
import cors from 'cors';
import { TUser } from './types';
import { db } from './database/knex';

const app = express();
const jwt = require('jsonwebtoken'); // Importando a biblioteca para geração de token

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Pong!");
});

// Função para gerar um token de autenticação
function generateToken(user: TUser): string {
  const payload = {
    id: user.id,
    email: user.email
  };
  //definindo o tempo do token:
  return jwt.sign(payload, 'sua_chave_secreta', { expiresIn: '1h' }); 
}

// Login do usuário
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user: TUser = await db("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken(user);

    // Retornar o token para o cliente
    return res.json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Pegando todos os usuários
app.get("/users", async (req: Request, res: Response) => {
  try {
    const usuarios: Array<TUser> = await db("users");
    res.status(200).send(usuarios);
  } catch (error) {
    console.log(error);
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado.");
    }
  }
});

// Criando um novo usuário
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { apelido, email, password } = req.body;

    if (apelido === undefined || email === undefined || password === undefined) {
      res.status(400);
      throw new Error ("O body precisa ter todos esses atributos: 'apelido', 'email' e 'password'");
    }

    if (typeof apelido !== "string") {
      res.statusCode = 400;
      throw new Error('O atributo "apelido" deve ser uma string');
    }
    if (apelido.length < 2) {
      res.statusCode = 400;
      throw new Error("O 'apelido' do usuário deve conter no mínimo 2 caracteres");
    }
    if (typeof email !== "string") {
      res.statusCode = 400;
      throw new Error ("O 'email' do usuário deve ser uma 'string'");
    }
    if (typeof password !== "string") {
      res.statusCode = 400;
      throw new Error ("O 'password' do usuário deve ser uma 'string'");
    }

    const newUser = {
      apelido: apelido,
      email: email,
      password: password,
    }

    await db("users").insert(newUser);
    res.status(201).send("Cadastro do usuário realizado com sucesso!");
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado.");
    }
  }
});
