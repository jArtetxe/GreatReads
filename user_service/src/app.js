// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { sequelize } = require("./models");
// const userRoutes = require("./routes/userRoutes");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/users", userRoutes);

// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');
// const swaggerDocument = YAML.load('./api-doc.yaml');

// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// const PORT = process.env.PORT || 3001;

// sequelize.sync({ alter: true }).then(() => {
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }); 
// ;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api-doc.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3001;

async function waitForMySQL(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Connected to MySQL!");
      return;
    } catch (err) {
      console.log(`MySQL not ready yet (${i + 1}/${retries})... retrying in ${delay}ms`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Could not connect to MySQL after retries");
}

waitForMySQL()
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("Failed to start app:", err);
    process.exit(1);
  });
