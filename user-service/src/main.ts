import app from "./infrastructure/http/server";

app.listen(3000, () =>
  console.log("user service start listening on port 3000")
);
