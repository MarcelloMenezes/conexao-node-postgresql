const conexao = require('../conexao');

const listarUsuarios = async (req, res) => {
    try {
        const { rows: usuarios } = await conexao.query(`select * from usuarios`);

        for (const usuario of usuarios) {
            const { rows: emprestimo } = await conexao.query('select * from emprestimos where id_usuario = $1', [usuario.id]);
            usuario.emprestimo = emprestimo;
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterUsuario = async (req, res) => {
    const { id } = req.params;
    try {

        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);
        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado.');
        }

        return res.status(200).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarUsuario = async (req, res) => {
    const { nome, idade, email, telefone, cpf } = req.body;

    try {
        const query = `insert into usuarios (nome, idade, email, telefone, cpf) 
        values ($1, $2, $3, $4, $5)`;
        const usuarioCadastrado = await conexao.query(query, [nome, idade, email, telefone, cpf]);

        if (usuarioCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastar o usuario');
        }

        return res.status(200).json('Usuario cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, cpf } = req.body;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado.');
        }

        const query = `update usuarios set 
        nome = $1,
        idade = $2,
        email = $3,
        telefone = $4,
        cpf = $5
        where id = $6`;

        const usuarioAtualizado = await conexao.query(query, [nome, idade, email, telefone, cpf, id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(400).json('Não foi possível atualizar o usuario');
        }

        return res.status(200).json('O usuario foi atualizado com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado.');
        }

        const verficar = await conexao.query('select * from usuarios join emprestimos on usuarios.id = emprestimos.id_usuario where usuarios.id = $1 AND emprestimos.emprestimo = $2', [id, 'pendente']);

        if (verficar.rowCount) {
            return res.status(400).json("Usuario está com livro pendente em nosso sistema")
        }


        const query = 'delete from usuarios where id = $1';
        const usuarioExcluido = await conexao.query(query, [id]);

        if (usuarioExcluido.rowCount === 0) {
            return res.status(400).json('Não foi possível excluir o usuario')
        }

        return res.status(200).json('O usuario foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarUsuarios,
    obterUsuario,
    cadastrarUsuario,
    atualizarUsuario,
    excluirUsuario
}