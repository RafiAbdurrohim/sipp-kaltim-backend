require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/perkara", require("./routes/perkara"));

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "SIPP Backend berjalan!" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
