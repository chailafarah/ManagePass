import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { decryptAesGcm, encryptAesGcm } from "./btxtiger/AesUtil";

// configures dotenv to work in your application
const app = express();

app.use(bodyParser.json());
app.use(cors())

app.post('/api/encrypt-aes-gcm', (req: Request, res: Response) => {
  const { plainText, password } = req.body;

  res.json({
    message: 'Encryption successful',
    encryptedData: encryptAesGcm(plainText, password)
  });
});

app.post('/api/decrypt-aes-gcm', (req, res) => {
  const { plainText, password } = req.body;

  res.json({
    message: 'Decryption successful',
    encryptedData: decryptAesGcm(plainText, password)
  });
});

app.listen(3000, () => { 
  console.log("Server running at PORT: ", 3000); 
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
