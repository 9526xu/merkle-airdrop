import express, { Request, Response } from 'express';
import claimRouter from './api/claim';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Merkle Airdrop Relayer is running!');
});

app.use('/api', claimRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
