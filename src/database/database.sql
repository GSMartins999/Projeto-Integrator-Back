-- Active: 1713126387827@@127.0.0.1@3306

DROP TABLE users;

-- Criando usuários:

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

-- DROP TABLE posts

-- CREATE TABLE posts (
--     id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
--     titulo TEXT NOT NULL,
--     description TEXT NOT NULL,
--     responsavelApelido TEXT NOT NULL,
--     FOREIGN KEY (responsavelApelido) REFERENCES users(apelido)
-- );


-- INSERT INTO posts(titulo, description, re) 
-- VALUES
-- ('Isa', 'i@gmail.com', '12345678'),
-- ('Nilton', 'N@gmail.com', '12345678'),
-- ('Giovanni', 'G@gmail.com', '12345678');
