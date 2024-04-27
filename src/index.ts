import express, { Request, Response} from 'express';
import cors from 'cors';
import { TComentarios, TPosts, TUser } from './types';
import { db } from './database/knex';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!");
});

function generateToken(user: TUser): string {
    const payload = {
        id: user.id,
        email: user.email
    };
    
    const secretKey = 'sua_chave_secreta'; 
    const options = { expiresIn: '1h' };
    
    return jwt.sign(payload, secretKey, options); 
}

async function updateNumComentarios(postId: number) {
    try {
        const result = await db('comentarios').count().where({ idPost: postId }).first();
        
        if (!result) {
            throw new Error("Não foi possível obter o número de comentários.");
        }

        const numComentarios = Number(result.count);

        await db('numComentarios').update({ quantidade: numComentarios }).where({ idPost: postId });
    } catch (error) {
        console.error('Erro ao atualizar o número de comentários:', error);
        throw error;
    }
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
        const { description, responsavelId, numeroCurtidas, numeroDeslikes, numeroComentarios } = req.body;

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

        await db("posts").insert({
            description: description,
            responsavelId: responsavelId,
            numeroCurtidas: numeroCurtidas || 0,
            numeroDeslikes: numeroDeslikes || 0, 
            numeroComentarios: numeroComentarios || 0, 
            dataCriacao: new Date().toISOString()
        });
        res.status(201).send("Post do usuário realizado com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});

//Pegar todos os posts
app.get("/posts", async (req, res) => {
    try {
        const result = await db("posts").select("*");
        res.status(200).send(result);
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});

// Curtir um post
app.post("/posts/:postId/likes", async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
  
      const postExists: TPosts = await db("posts").where({ id: postId }).first();
      if (!postExists) {
        return res.status(404).json({ error: "O post não foi encontrado." });
      }
  
      await db("likes").insert({
        postId: postId,
        userId: userId,
        dataCurtidas: new Date().toISOString()
      });
      
      await db("posts").where({ id: postId }).increment('numeroCurtidas', 1);
  
      return res.status(200).json({ message: "Post curtido com sucesso!" });
    } catch (error) {
      console.log("Error: ", error);
      return res.status(500).json({ error: "Erro interno do servidor ao curtir o post." });
    }
  });

  
  // Descurtir um post
  app.post("/posts/:postId/deslikes", async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.body.userId;
  
      const postExists = await db("posts").where({ id: postId }).first();
      if (!postExists) {
        return res.status(404).json({ error: "O post não foi encontrado." });
      }
  
      await db("deslikes").insert({
        postId: postId,
        userId: userId,
        dataDescurtidas: new Date().toISOString()
      });
      await db("posts").where({ id: postId }).increment('numeroDeslikes', 1);
  
      return res.status(200).json({ message: "Post descurtido com sucesso!" });
    } catch (error) {
      console.log("Error: ", error);
      return res.status(500).json({ error: "Erro interno do servidor ao descurtir o post." });
    }
  });
  


// Obtendo todos os likes
app.get("/likes", async (req, res) => {
    try {
        const likes = await db("likes").select("*");
        res.status(200).send(likes);
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});

// Obtendo todos os deslikes
app.get("/deslikes", async (req, res) => {
    try {
        const deslikes = await db("deslikes").select("*");
        res.status(200).send(deslikes);
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});

// Comentar um post
app.post("/posts/:postId/comentarios", async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const { comentario, responsavelId } = req.body;

        if(postId === undefined){
            res.status(400).send("é necessário identificar o postId")
            return;
        }
        if (comentario === undefined || responsavelId === undefined) {
            res.status(400).send("O body precisa ter todos esses atributos: 'comentario', 'responsavelId'");
            return;
        }

        if (typeof comentario !== "string") {
            res.status(400).send("O 'texto' do comentário deve ser uma string");
            return;
        }

        if (comentario.length < 1) {
            res.status(400).send("O 'texto' do comentário deve conter no mínimo 1 caracter");
            return;
        }

        if (typeof responsavelId !== "number") {
            res.status(400).send("O 'usuarioId' do comentário deve ser uma 'number'");
            return;
        }

        await db("comentarios").insert({
            idPost: postId,
            comentario: comentario,
            responsavelId: responsavelId,
            dataCriacao: new Date().toISOString()
        });

        await updateNumComentarios(postId);

        res.status(201).send("Comentário adicionado com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});

// Obtendo todos os comentários de um post específico
app.get("/posts/:postId/comentarios", async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const comentarios = await db("comentarios").where({ idPost: postId });
        res.status(200).send(comentarios);
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});


//Curtindo um comentário de um post:
app.post("/posts/:postId/comentarios/:comentarioId/likes", async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const comentarioId = Number(req.params.comentarioId);
        const userId = Number(req.body.userId);

        await db("likesComent").insert({ comentarioId, userId });

        await db("comentarios").where({ id: comentarioId }).increment("numeroCurtidas", 1);

        res.status(200).send("Comentário curtido com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});


//Deslike de um comentário de um post:
app.post("/posts/:postId/comentarios/:comentarioId/deslikes", async (req, res) => {
    try {
        const postId = Number(req.params.postId);
        const comentarioId = Number(req.params.comentarioId);
        const userId = Number(req.body.userId);

        await db("deslikesComent").insert({ comentarioId, userId });

        await db("comentarios").where({ id: comentarioId }).increment("numeroDeslikes", 1);

        res.status(200).send("Deslike no comentário com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro inesperado.");
    }
});


// Endpoint para curtir um comentário
app.post("/comentarios/:comentarioId/likes", async (req, res) => {
    try {
        const comentarioId = req.params.comentarioId;
        const userId = req.body.userId;

        const comentarioExists = await db("comentarios").where({ id: comentarioId }).first();
        if (!comentarioExists) {
            return res.status(404).json({ error: "O comentário não foi encontrado." });
        }

        await db("likesComent").insert({
            comentarioId: comentarioId,
            userId: userId,
            dataCurtidas: new Date().toISOString()
        });

        return res.status(200).json({ message: "Comentário curtido com sucesso!" });
    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: "Erro interno do servidor ao curtir o comentário." });
    }
});

app.post("/comentarios/:comentarioId/deslikes", async (req, res) => {
    try {
        const comentarioId = req.params.comentarioId;
        const userId = req.body.userId;

        const comentarioExists = await db("comentarios").where({ id: comentarioId }).first();
        if (!comentarioExists) {
            return res.status(404).json({ error: "O comentário não foi encontrado." });
        }

        await db("deslikesComent").insert({
            comentarioId: comentarioId,
            userId: userId,
            dataCurtidas: new Date().toISOString()
        });

        return res.status(200).json({ message: "Comentário descurtido com sucesso!" });
    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: "Erro interno do servidor ao descurtir o comentário." });
    }
});

