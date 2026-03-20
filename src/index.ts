import express from "express";

const app = express();
const port = Number(process.env.PORT) || 8000;

app.get("/", (_req, res) => {
	res.json({ message: "Classroom backend is running" });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
