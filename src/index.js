import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    console.log(`Database connection successfull!`);
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
    app.on("error", (error) => {
      console.log(`Error: ${error}`);
      throw error;
    });
  })
  .catch((err) => {
    console.log(`Error after connecting: ${err}`);
  });

// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (err) => {
//       console.log("Error :", err);
//       throw err;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port: ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error :", err);
//   }
// })();
