create database projetopis;
use projetopis;

CREATE TABLE TipoUtilizador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL
);

CREATE TABLE TipoProfissao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL
);

CREATE TABLE Pegi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo INT NOT NULL
);

CREATE TABLE Utilizador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tipo INT NOT NULL,
    FOREIGN KEY (tipo) REFERENCES TipoUtilizador(id)
);

CREATE TABLE Pessoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo INT NOT NULL,
    FOREIGN KEY (tipo) REFERENCES TipoProfissao(id)
);

CREATE TABLE Genero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE Filme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idPegi INT NOT NULL,
    idDiretorPessoa INT NOT NULL,
    DataLancamento DATETIME NOT NULL,
    tipo ENUM('FILME', 'SERIE') NOT NULL,
    FOREIGN KEY (idPegi) REFERENCES Pegi(id),
    FOREIGN KEY (idDiretorPessoa) REFERENCES Pessoa(id)
);

CREATE TABLE Review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUtilizador INT NOT NULL,
    idFilme INT NOT NULL,
    dataReview DATETIME NOT NULL,
    avaliacao TINYINT NOT NULL,
    critica TEXT,
    votosUtilidade INT,
    FOREIGN KEY (idUtilizador) REFERENCES Utilizador(id),
    FOREIGN KEY (idFilme) REFERENCES Filme(id)
);

CREATE TABLE Favorito (
    idFilme INT NOT NULL,
    idUtilizador INT NOT NULL,
    PRIMARY KEY(idFilme, idUtilizador),
    FOREIGN KEY (idFilme) REFERENCES Filme(id),
    FOREIGN KEY (idUtilizador) REFERENCES Utilizador(id)
);

CREATE TABLE FilmeGenero (
    idFilme INT NOT NULL,
    idGenero INT NOT NULL,
    PRIMARY KEY(idFilme, idGenero),
    FOREIGN KEY (idFilme) REFERENCES Filme(id),
    FOREIGN KEY (idGenero) REFERENCES Genero(id)
);

CREATE TABLE FilmePessoa (
    idFilme INT NOT NULL,
    idPessoa INT NOT NULL,
    papel TEXT NOT NULL,
    elencoPrincipal BOOLEAN NOT NULL,
    PRIMARY KEY(idFilme, idPessoa),
    FOREIGN KEY (idFilme) REFERENCES Filme(id),
    FOREIGN KEY (idPessoa) REFERENCES Pessoa(id)
);

INSERT INTO TipoUtilizador (tipo)
VALUES ('normalUser'), ('adminUser');

