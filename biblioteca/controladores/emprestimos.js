const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {
    try {
        const query = `select emprestimos.id, usuarios.nome AS usuario, usuarios.telefone, usuarios.email, livros.nome AS livro, emprestimos.emprestimo AS status from emprestimos 
        join usuarios on emprestimos.id_usuario = usuarios.id
        join livros on livros.id = emprestimos.id_livro`;

        const { rows: emprestimos } = await conexao.query(query);
        return res.status(200).json(emprestimos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterEmprestimo = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `select emprestimos.id, usuarios.nome AS usuario, usuarios.telefone, usuarios.email, livros.nome AS livro, emprestimos.emprestimo AS status from emprestimos 
        join usuarios on emprestimos.id_usuario = usuarios.id
        join livros on livros.id = emprestimos.id_livro where emprestimos.id = $1`;
        const emprestimo = await conexao.query(query, [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado.');
        }

        return res.status(200).json(emprestimo.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarEmprestimo = async (req, res) => {
    const { id_usuario, id_livro, emprestimo } = req.body;

    try {
        if (emprestimo === "pendente" || emprestimo === "devolvido") {
            const query = `insert into emprestimos (id_usuario, id_livro, emprestimo) 
            values ($1, $2, $3 )`;
            const emprestimoCadastrado = await conexao.query(query, [id_usuario, id_livro, emprestimo]);
            if (emprestimoCadastrado.rowCount === 0) {
                return res.status(400).json('Não foi possivel cadastar o emprestimo');
            }
        } else {
            return res.status(400).json("Emprestimo só pode receber pendente ou devolvido")
        }

        return res.status(200).json('Emprestimo cadastrado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarEmprestimo = async (req, res) => {
    const { id } = req.params;
    const { emprestimo } = req.body;

    try {
        const emprestimoNovo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimoNovo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado.');
        }


        if (emprestimo === "pendente" || emprestimo === "devolvido") {

            const query = `update emprestimos set 
            emprestimo = $1
            where id = $2`;

            const emprestimoAtualizado = await conexao.query(query, [emprestimo, id]);

            if (emprestimoAtualizado.rowCount === 0) {
                return res.status(400).json('Não foi possível atualizar o emprestimo');
            }

            return res.status(200).json('O emprestimo foi atualizado com sucesso');
        } else {
            return res.status(400).json("Emprestimo só pode receber pendente ou devolvido")
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado.');
        }

        const query = 'delete from emprestimos where id = $1';
        const emprestimoExcluido = await conexao.query(query, [id]);

        if (emprestimoExcluido.rowCount === 0) {
            return res.status(400).json('Não foi possível excluir o emprestimo')
        }

        return res.status(200).json('O emprestimo foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarEmprestimos,
    obterEmprestimo,
    cadastrarEmprestimo,
    atualizarEmprestimo,
    excluirEmprestimo
}