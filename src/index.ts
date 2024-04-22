import express, { Request, Response} from 'express';
import cors from 'cors';
import { TComentarios, TPosts, TUser } from './types';
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



//Criando um novo post


app.post("/posts", async (req, res) => {
  try {
    const { id, description, responsavelId, numeroCurtidas, numeroDeslikes, numeroComentarios } = req.body;

    if (description === undefined || responsavelId === undefined) {
      res.status(400).send("O body precisa ter todos esses atributos: 'id', 'description', 'responsavelId'");
      return;
    }

    if (typeof description !== "string") {
      res.status(400).send("O 'description' do usuário deve ser uma string");
      return;
    }

    if (description.length < 1) {
      res.status(400).send("O 'description' do usuário deve conter no mínimo 1 caracter");
      return;
    }

    if (typeof responsavelId !== "number") {
      res.status(400).send("O 'responsavelId' do usuário deve ser uma 'number'");
      return;
    }

    // Insere o novo post na tabela 
    await db("posts").insert({
      id: id,
      description: description,
      responsavelId: responsavelId,
      numeroCurtidas: numeroCurtidas || 0,
      numeroDeslikes: numeroDeslikes || 0, 
      numeroComentarios: numeroComentarios || 0, 
      dataCriacao: new Date().toISOString()
    });

    // Retorna uma resposta de sucesso
    res.status(201).send("Post do usuário realizado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    // Retorna uma resposta de erro caso ocorra algum problema
    res.status(500).send("Erro inesperado.");
  }
});



//Pegando os Posts

app.get("/posts", async (req: Request, res: Response) => {
  try {
    const user_posts: TPosts[] = await db.select().from("posts");
    res.status(200).send(user_posts);
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


//Comentando Outros Posts

app.post("/posts/:postId/comentarios", async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const { comentario, responsavelId, numeroCurtidas, numeroDeslikes } = req.body;

    if (!postId) {
      return res.status(400).send("O ID do post é obrigatório.");
    }

    // Insere o novo comentário na tabela
    await db("comentarios").insert({
      idPost: postId,
      comentario: comentario,
      responsavelId: responsavelId,
      numeroCurtidas: numeroCurtidas || 0,
      numeroDeslikes: numeroDeslikes || 0, 
      dataCriacao: new Date().toISOString()
    });

    res.status(201).send("Comentário adicionado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro inesperado.");
  }
});


//Pegando os comentarios

app.get("/comentarios", async (req: Request, res: Response) => {
  try {
    const user_comentarios: TComentarios[] = await db.select().from("comentarios");
    res.status(200).send(user_comentarios);
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


//Deletando Comentários

app.delete("/posts/:postId/comentarios/:comentarioId", async (req, res) => {
  try {
    //transformando o id em number e basando sua base para decimal(definimos a base para não ter erros no futuro)
    const postId = parseInt(req.params.postId, 10);
    const comentarioId = parseInt(req.params.comentarioId, 10);

    if (isNaN(postId) || isNaN(comentarioId)) {
      return res.status(400).send("IDs de post e comentário devem ser números inteiros válidos.");
    }

    const postExists = await db("posts").where({ id: postId }).first();
    if (!postExists) {
      return res.status(404).send("O post não foi encontrado.");
    }

    await db("comentarios").where({ id: comentarioId, idPost: postId }).del();

    res.status(200).send("Comentário deletado com sucesso.");
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).send("Erro ao deletar o comentário.");
  }
});