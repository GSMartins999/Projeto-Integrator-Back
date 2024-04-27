const axios = require('axios');

// Endpoint URL
const BASE_URL = 'http://localhost:3003';

// Teste para o endpoint de login
test('Login de usuário válido', async () => {
  const response = await axios.post(`${BASE_URL}/login`, {
    email: 'example@example.com',
    password: 'senha123'
  });
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('token');
});

// Teste para o endpoint de obtenção de todos os usuários
test('Obter todos os usuários', async () => {
  const response = await axios.get(`${BASE_URL}/users`);
  expect(response.status).toBe(200);
  expect(response.data.length).toBeGreaterThan(0);
});

// Teste para o endpoint de criação de um novo usuário
test('Criar novo usuário', async () => {
  const response = await axios.post(`${BASE_URL}/users`, {
    apelido: 'NovoUsuário',
    email: 'novo@example.com',
    password: 'senha123'
  });
  expect(response.status).toBe(201);
});

// Teste para o endpoint de criação de um novo post
test('Criar novo post', async () => {
  const response = await axios.post(`${BASE_URL}/posts`, {
    description: 'Novo post de teste',
    responsavelId: 1,
    numeroCurtidas: 0,
    numeroDeslikes: 0,
    numeroComentarios: 0
  });
  expect(response.status).toBe(201);
});

// Teste para o endpoint de obtenção de todos os posts
test('Obter todos os posts', async () => {
  const response = await axios.get(`${BASE_URL}/posts`);
  expect(response.status).toBe(200);
  expect(response.data.length).toBeGreaterThan(0);
});

// Teste para o endpoint de curtir um post
test('Curtir um post', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const response = await axios.post(`${BASE_URL}/posts/${postId}/likes`, { userId: 1 });
  expect(response.status).toBe(200);
});

// Teste para o endpoint de descurtir um post
test('Descurtir um post', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const response = await axios.post(`${BASE_URL}/posts/${postId}/deslikes`, { userId: 1 });
  expect(response.status).toBe(200);
});

// Teste para o endpoint de obtenção de todos os likes
test('Obter todos os likes', async () => {
  const response = await axios.get(`${BASE_URL}/likes`);
  expect(response.status).toBe(200);
});

// Teste para o endpoint de obtenção de todos os deslikes
test('Obter todos os deslikes', async () => {
  const response = await axios.get(`${BASE_URL}/deslikes`);
  expect(response.status).toBe(200);
});

// Teste para o endpoint de criação de um novo comentário
test('Criar novo comentário', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const response = await axios.post(`${BASE_URL}/posts/${postId}/comentarios`, {
    comentario: 'Novo comentário de teste',
    responsavelId: 1
  });
  expect(response.status).toBe(201);
});

// Teste para o endpoint de obtenção de todos os comentários de um post específico
test('Obter todos os comentários de um post', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const response = await axios.get(`${BASE_URL}/posts/${postId}/comentarios`);
  expect(response.status).toBe(200);
});

// Teste para o endpoint de exclusão de um comentário
test('Excluir um comentário', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const comentarioId = 1; // Substitua pelo ID de um comentário existente
  const response = await axios.delete(`${BASE_URL}/posts/${postId}/comentarios/${comentarioId}`);
  expect(response.status).toBe(200);
});

// Teste para o endpoint de curtir um comentário de um post
test('Curtir um comentário de um post', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const comentarioId = 1; // Substitua pelo ID de um comentário existente
  const response = await axios.post(`${BASE_URL}/posts/${postId}/comentarios/${comentarioId}/likes`, { userId: 1 });
  expect(response.status).toBe(200);
});

// Teste para o endpoint de descurtir um comentário de um post
test('Descurtir um comentário de um post', async () => {
  const postId = 1; // Substitua pelo ID de um post existente
  const comentarioId = 1; // Substitua pelo ID de um comentário existente
  const response = await axios.post(`${BASE_URL}/posts/${postId}/comentarios/${comentarioId}/deslikes`, { userId: 1 });
  expect(response.status).toBe(200);
});

// Teste para o endpoint de curtir um comentário
test('Curtir um comentário', async () => {
  const comentarioId = 1; // Substitua pelo ID de um comentário existente
  const response = await axios.post(`${BASE_URL}/comentarios/${comentarioId}/likes`, { userId: 1 });
  expect(response.status).toBe(200);
});

// Teste para o endpoint de descurtir um comentário
test('Descurtir um comentário', async () => {
  const comentarioId = 1; // Substitua pelo ID de um comentário existente
  const response = await axios.post(`${BASE_URL}/comentarios/${comentarioId}/deslikes`, { userId: 1 });
  expect(response.status).toBe(200);
});
