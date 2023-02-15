import express from "express";

const app = express();

app.listen(3001, () => {
    console.log("server started")
});

app.get('/', (req, res) => {
    res.send('hello world')
  })



