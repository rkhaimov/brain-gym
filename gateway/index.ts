import express from 'express';

const app = express();

app.use((request, response) => {
  console.log(request.url);

  response.send();
});

app.listen(3000);
