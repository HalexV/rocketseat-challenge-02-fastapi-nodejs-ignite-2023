# Daily-Diet API

## Sobre

Esse é um projeto desenvolvido para cumprir o desafio 2 do módulo 2 do ignite Nodejs versão 2023.

O projeto consiste em desenvolver uma API para que os usuários possam registrar refeições feitas e se elas estão dentro ou não da dieta.

---

## Tabela de conteúdos

<!--ts-->

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Endpoints](#endpoints)
- [Pré-requisitos e como rodar a aplicação](#pre-requisitos)
- [Models](#models)
- [Autor](#autor)

<!--te-->

---

## Funcionalidades

- [x] Deve ser possível criar um usuário.
- [x] Deve ser possível autenticar um usuário.
- [x] Deve ser possível identificar o usuário entre as requisições.
- [x] Deve ser possível registrar uma refeição feita.
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima.
- [x] Deve ser possível apagar uma refeição.
- [x] Deve ser possível listar todas as refeições de um usuário.
- [x] Deve ser possível visualizar uma única refeição.
- [x] Deve ser possível recuperar as métricas de um usuário.
  - [x] Quantidade total de refeições registradas.
  - [x] Quantidade total de refeições dentro da dieta.
  - [x] Quantidade total de refeições fora da dieta.
  - [x] Melhor sequência por dia de refeições dentro da dieta.
- [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou.

---

## Endpoints

---

### /users

#### POST

##### Summary

Rota utilizada para criar um usuário.

##### Description

##### Body Parameters

Body type: `JSON`

| Name     | Type   | Description     | Required |
| -------- | ------ | --------------- | -------- |
| email    | string | User's email    | yes      |
| password | string | User's password | yes      |

##### Responses

- 201

  ```json
  {
    "message": "User created!"
  }
  ```

- 400
  - Field validation errors
  ```JSON
  {
  	"issues": [
  		{
  			"validation": "email",
  			"code": "invalid_string",
  			"message": "Invalid email",
  			"path": [
  				"email"
  			]
  		},
  		{
  			"code": "invalid_type",
  			"expected": "string",
  			"received": "undefined",
  			"path": [
  				"password"
  			],
  			"message": "Required"
  		}
  	],
  	"message": "Validation issues!"
  }
  ```
  or
  ```JSON
  {
    "message": "User already exists!"
  }
  ```

<br>

---

### /users/authenticate

#### POST

##### Summary

Rota utilizada para autenticar um usuário.

##### Description

O usuário receberá da API o token JWT para utilizar nas requisições que necessitem de autenticação.

##### Body Parameters

Body type: `JSON`

| Name     | Type   | Description     | Required |
| -------- | ------ | --------------- | -------- |
| email    | string | User's email    | yes      |
| password | string | User's password | yes      |

##### Responses

- 200

  ```json
  {
    "message": "User authenticated!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }
  ```

- 400
  - Field validation errors
  ```JSON
  {
  	"issues": [
  		{
  			"validation": "email",
  			"code": "invalid_string",
  			"message": "Invalid email",
  			"path": [
  				"email"
  			]
  		},
  		{
  			"code": "invalid_type",
  			"expected": "string",
  			"received": "undefined",
  			"path": [
  				"password"
  			],
  			"message": "Required"
  		}
  	],
  	"message": "Validation issues!"
  }
  ```
  or
  ```JSON
  {
  	"message": "Email or password incorrect!"
  }
  ```

<br>

---

### /meals

#### POST

##### Summary

Rota utilizada para registrar uma refeição.

##### Description

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Body Parameters

Body type: `JSON`

| Name        | Type    | Description                                                                                                                                           | Required |
| ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| name        | string  | Name of meal                                                                                                                                          | yes      |
| description | string  | Description of meal                                                                                                                                   | yes      |
| datetime    | string  | An [datetime string format (ISO 8601)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) | yes      |
| diet        | boolean | It's on diet or not                                                                                                                                   | yes      |

##### Responses

- 201

  ```json
  {
    "message": "Meal created!"
  }
  ```

- 400
  - Field validation errors
  ```JSON
  {
  	"issues": [
  		{
  			"code": "invalid_type",
  			"expected": "string",
  			"received": "undefined",
  			"path": [
  				"name"
  			],
  			"message": "Required"
  		},
  		{
  			"code": "invalid_type",
  			"expected": "string",
  			"received": "undefined",
  			"path": [
  				"description"
  			],
  			"message": "Required"
  		},
  		{
  			"code": "invalid_date",
  			"path": [
  				"datetime"
  			],
  			"message": "Invalid date"
  		},
  		{
  			"code": "invalid_type",
  			"expected": "boolean",
  			"received": "undefined",
  			"path": [
  				"diet"
  			],
  			"message": "Required"
  		}
  	],
  	"message": "Validation issues!"
  }
  ```

<br>

#### GET

##### Summary

Rota utilizada para listar todas as refeições registradas do usuário.

##### Description

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Responses

- 200

  ```json
  {
    "meals": [
      {
        "id": "1221d84b-afb9-4762-9b8f-ae10ef07848c",
        "userId": "1fcee5e0-6052-4a94-a921-19082f54cc03",
        "name": "Arroz, feijão e carne",
        "description": "Arroz branco, feijão preto e bife",
        "datetime": "2023-05-07T00:00:01.105Z",
        "diet": false
      },
      {
        "id": "36316b71-e4d3-4fef-9ef3-c7889e199127",
        "userId": "1fcee5e0-6052-4a94-a921-19082f54cc03",
        "name": "Arroz, feijão e carne",
        "description": "Arroz branco, feijão preto e bife",
        "datetime": "2023-05-07T00:03:50.123Z",
        "diet": true
      },
      {
        "id": "082cc11b-88b2-4839-ad2e-b045a9d826c2",
        "userId": "1fcee5e0-6052-4a94-a921-19082f54cc03",
        "name": "Feijão e carne",
        "description": "Feijão preto e bife",
        "datetime": "2023-05-08T18:27:41.825Z",
        "diet": true
      }
    ]
  }
  ```

<br>

---

### /meals/:id

#### GET

##### Summary

Rota utilizada para listar uma refeição específica do usuário.

##### Description

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Path Parameters

| Name | Description |
| ---- | ----------- |
| id   | Meal id     |

##### Responses

- 200

  ```json
  {
    "meal": {
      "id": "082cc11b-88b2-4839-ad2e-b045a9d826c2",
      "userId": "1fcee5e0-6052-4a94-a921-19082f54cc03",
      "name": "Feijão e carne",
      "description": "Feijão preto e bife",
      "datetime": "2023-05-08T18:27:41.825Z",
      "diet": true
    }
  }
  ```

- 404
  ```JSON
  {
  	"message": "Meal not found!"
  }
  ```

<br>

#### PUT

##### Summary

Rota utilizada para editar uma refeição específica do usuário.

##### Description

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Path Parameters

| Name | Description |
| ---- | ----------- |
| id   | Meal id     |

##### Body Parameters

Body type: `JSON`

| Name        | Type    | Description                                                                                                                                           | Required |
| ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| name        | string  | Name of meal                                                                                                                                          | No       |
| description | string  | Description of meal                                                                                                                                   | No       |
| datetime    | string  | An [datetime string format (ISO 8601)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) | No       |
| diet        | boolean | It's on diet or not                                                                                                                                   | No       |

##### Responses

- 200

  ```json
  {
    "message": "Meal updated!"
  }
  ```

- 400
  - Field validation errors
  ```JSON
  {
  	"issues": [
  		{
  			"code": "invalid_type",
  			"expected": "boolean",
  			"received": "string",
  			"path": [
  				"diet"
  			],
  			"message": "Expected boolean, received string"
  		}
  	],
  	"message": "Validation issues!"
  }
  ```
  or
  - Any of valid fields is sent
  ```JSON
  {
  	"message": "No data to edit!"
  }
  ```
- 404
  ```JSON
  {
  	"message": "Meal not found!"
  }
  ```

<br>

#### DELETE

##### Summary

Rota utilizada para apagar uma refeição específica do usuário.

##### Description

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Path Parameters

| Name | Description |
| ---- | ----------- |
| id   | Meal id     |

##### Responses

- 200

  ```json
  {
    "message": "Meal deleted!"
  }
  ```

- 404
  ```JSON
  {
  	"message": "Meal not found!"
  }
  ```

<br>

---

### /meals/statistics

#### GET

##### Summary

Rota utilizada para obter as estatísticas do usuário.

##### Description

As estatísticas informadas se referem a:

- Total de refeições registradas.
- Total de refeições dentro da dieta.
- Total de refeições fora da dieta.
- A quantidade da maior sequência de pratos dentro da dieta.

##### Header Parameters

| Name          | Description      | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer JWT Token | yes      |

##### Responses

- 200

  ```json
  {
    "statistics": {
      "meals_total": 3,
      "meals_on_diet_total": 2,
      "meals_off_diet_total": 1,
      "best_sequence_meals_on_diet": 2
    }
  }
  ```

<br>

---

### Authentication Responses

- 400
  - No authorization header or no Bearer JWT token
  ```json
  {
    "message": "Bearer jwt token required on authorization header!"
  }
  ```
- 401
  ```json
  {
    "message": "Invalid token!"
  }
  ```

<br>

---

<h2 id="pre-requisitos">Pré-requisitos e como executar a aplicação</h2>

Você vai precisar ter instalado no seu computador:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (>= v18)
- [Visual Studio Code](https://code.visualstudio.com/) (opcional)

<br>

### Baixando o projeto

Para baixar esse projeto:

```
# Abra o seu terminal.

# Clone esse repositório para a sua máquina.

$ git clone https://github.com/HalexV/rocketseat-challenge-02-fastapi-nodejs-ignite-2023.git

```

<br>

### Instalando as dependências para modificar o projeto

```
# Entre na pasta do projeto.

$ cd pasta_do_projeto

# Rode o seguinte comando para instalar as dependências do projeto:

$ npm install ci

```

<br>

### Criando os arquivos de variáveis de ambiente

Você deve criar os arquivos `.env` (para desenvolvimento) e `.env.test` (para rodar e gerenciar os testes) a partir dos arquivos correspondentes `.env.example` e `.env.test.example`.
Esses arquivos de exemplo contém as variáveis de ambiente necessárias para executar a aplicação em modo de desenvolvimento e testes.

<br>

### Rodando as migrations

```
# Entre na pasta do projeto.

$ cd pasta_do_projeto

# Rode o seguinte comando para aplicar as migrations:

$ npm run knex -- migrate:latest

```

<br>

### Rodando comandos do knex

```
# Entre na pasta do projeto.

$ cd pasta_do_projeto

# Se for necessário criar novas migrations ou realizar outras operações que dependam do knex basta utilizar o comando abaixo:

$ npm run knex -- insira os comandos knex aqui

```

<br>

### Rodando o eslint e prettier antes de cada commit

Se você estiver utilizando o VSCode com as extensões do eslint e prettier instaladas talvez você não precise rodar este comando.
Caso contrário rode o comando do lint antes de realizar o commit das suas alterações.
O lint será aplicado no diretório src e test.

```
# Entre na pasta do projeto.

$ cd pasta_do_projeto

$ npm run lint

```

<br>

### Executando o projeto em modo de desenvolvimento

```
# Na raiz do projeto (local onde fica o package.json), execute:

$ npm run dev

# O servidor estará rodando em http://localhost:3000 se você utilizar a porta 3000 no arquivo .env.

# Para encerrar a execução em modo de desenvolvimento, pressione as teclas no seu terminal:

$ Ctrl+C ou Ctrl+D

```

<br>

### Executando o projeto em modo de testes

```
# Na raiz do projeto (local onde fica o package.json), execute:

$ npm test ou npm t ou npm run test

# Para encerrar a execução em modo de testes, pressione as teclas no seu terminal:

$ Ctrl+C ou Ctrl+D

```

<br>

### Gerando a build do projeto

```
# Na raiz do projeto (local onde fica o package.json), execute:

$ npm run build

```

<br>

---

### Models

<br>

#### Users

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| id       | uuid   |             |
| email    | string |             |
| password | string |             |

<br>

#### Meals

| Name        | Type    | Description                                                                                                                                           |
| ----------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| id          | uuid    |                                                                                                                                                       |
| userId      | uuid    |                                                                                                                                                       |
| name        | string  | Name of meal                                                                                                                                          |
| description | string  | Description of meal                                                                                                                                   |
| datetime    | string  | An [datetime string format (ISO 8601)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) |
| diet        | boolean | It's on diet or not                                                                                                                                   |

<br>

---

# Autor

<div>
  <img src="https://avatars.githubusercontent.com/u/14897195?s=96&v=4" alt="Hálex Viotto Gomes" title="Hálex Viotto Gomes" />
  <p>Hálex Viotto Gomes</p>
</div>

<div>
  <a href="https://github.com/HalexV">
    <img src="https://img.shields.io/static/v1?label=GitHub&message=HalexV&color=181717&style=for-the-badge&logo=GitHub"/>
  </a>

  <a href="https://www.linkedin.com/in/halexviottogomes/">
    <img src="https://img.shields.io/static/v1?label=LinkedIn&message=Hálex Viotto Gomes&color=0A66C2&style=for-the-badge&logo=LinkedIn"/>
  </a>
</div>
