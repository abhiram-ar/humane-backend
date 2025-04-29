import app from "./infrastructure/http/server";
import connectDB from "./infrastructure/persistance/mongoDB/client";

const start = async () => {
  try {
    await connectDB();

    app.listen(3000, () =>
      console.log("user service start listening on port 3000")
    );
  } catch (error) {
    console.error("Error while starting user service");
    console.error(error);
  }
};

start();
