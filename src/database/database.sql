-- Active: 1713126387827@@127.0.0.1@3306

-- Criando Tabela de Usuários:


DROP TABLE users;


CREATE TABLE users(
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    apelido TEXT NOT NULL, 
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);


--Populando a tabela users
INSERT INTO users(apelido, email, password) 
VALUES
('Isa', 'i@gmail.com', '12345678'),
('Nilton', 'N@gmail.com', '12345678'),
('Giovanni', 'G@gmail.com', '12345678');


--Selecionando a tabela users
SELECT * FROM users


-------------------------------------------------------------------------------------------

--Criando a tabela posts

DROP TABLE posts

CREATE TABLE posts (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    description TEXT NOT NULL,
    responsavelId INT NOT NULL,
    numeroCurtidas INT,
    numeroDeslikes INT,
    numeroComentarios INT,
    dataCriacao TEXT NOT NULL,
    FOREIGN KEY (responsavelId) REFERENCES users(id)
);


INSERT INTO posts(description, responsavelId,numeroCurtidas, numeroDeslikes,numeroComentarios, dataCriacao) 
VALUES
('Dizendo oi para o mundo', 1, 25, 50, 125, CURRENT_TIMESTAMP),
('Essa função retorna o carimbo de data/hora do sistema do banco de dados atual como um valor de datetime sem o deslocamento de fuso horário do banco de dados. CURRENT_TIMESTAMP deriva esse valor do sistema operacional do computador no qual a instância do SQL Server é executada.', 2, 9021, 100, 200, CURRENT_TIMESTAMP)


SELECT * FROM posts



-----------------------------------------------------------------------------------

--Tabela de comentários


DROP TABLE comentarios


CREATE TABLE comentarios(
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    idComentario INT NOT NULL,
    comentario TEXT NOT NULL,
    responsavelId INT NOT NULL,
    numeroCurtidas INT,
    numeroDeslikes INT,
    dataCriacao TEXT NOT NULL,
    FOREIGN KEY(idComentario) REFERENCES posts(id)
    FOREIGN KEY(responsavelId) REFERENCES users(id)
);


INSERT INTO comentarios( idComentario, comentario, responsavelId, numeroCurtidas, numeroDeslikes, dataCriacao) 
VALUES
(2, 'Oi para vc também',2, 25, 30, CURRENT_TIMESTAMP),
(1, 'Você está certo',1, 9021, 80, CURRENT_TIMESTAMP)


SELECT * FROM comentarios