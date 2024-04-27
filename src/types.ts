export type TUser = {
    id: number,
    apelido:string,
    email: string,
    password: string | number,
}

export type TPosts = {
    id: number,
    description: string,
    responsavelId: number,
    numeroCurtidas?: number,
    numeroDeslikes?: number,
    numeroComentarios?: number,
    dataCriacao: string,
}

export type TComentarios = {
    id: number,
    idComentario: number,
    comentario: string,
    responsavelId?: number,
    numeroCurtidas?: number,
    numeroDeslikes?: number,
    dataCriacao: string,
}



