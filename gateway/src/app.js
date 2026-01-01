const express = require("express");
const cors = require("cors");
const axios = require("axios");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDocument = YAML.load("./api-doc.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/api/users/register", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/users/register",
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: err.message }
    );
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/users/login",
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: err.message }
    );
  }
});

app.post("/api/books/reading", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3002/api/books/reading",
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(
      err.response?.data || { error: err.message }
    );
  }
});

app.get("/api/books/reading", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:3002/api/books/reading",
      {
        headers: { Authorization: req.headers.authorization }
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.get("/api/books/search", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:3002/api/books/search?q=${encodeURIComponent(req.query.q)}`
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

app.get("/api/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    const response = await axios.get(
      `http://localhost:3002/api/books/${bookId}`
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

app.get("/api/books/:bookId/status", async (req, res) => {
  try {
    const { bookId } = req.params;
    const response = await axios.get(`http://localhost:3002/api/books/${bookId}/status`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
});

app.listen(3000, () => console.log("Gateway running on port 3000"));
