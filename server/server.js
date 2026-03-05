const express = require("express")
const cors = require("cors")
const path = require("path")

// routers
const usersRouter = require("./routes/users")
const logsRouter = require("./routes/logs")

const app = express()

app.use(cors())
app.use(express.json())

// serve frontend files
app.use(express.static(path.join(__dirname, "../public")))

// api routes
app.use("/api/users", usersRouter)
app.use("/api/logs", logsRouter)

app.get("/", (req, res) => {
  res.send("Smart Gate Backend Running")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})