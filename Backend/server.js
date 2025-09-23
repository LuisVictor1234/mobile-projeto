const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
console.log('Rotas de usuário importadas.');
app.use("/api/users", userRoutes);
console.log('Rotas de usuário configuradas para "/api/users".');

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});