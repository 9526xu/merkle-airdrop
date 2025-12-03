import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import claimRouter from './api/claim';
import whitelistRouter from './api/whitelist';
import adminRouter from './api/admin';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Merkle Airdrop Relayer is running!');
});

app.use('/api', claimRouter);
app.use('/api/whitelist', whitelistRouter);
app.use('/api/admin', adminRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
