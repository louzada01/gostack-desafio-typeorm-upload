import { Router } from 'express';
import { getRepository } from 'typeorm';

import multer from 'multer';

import Transactions from '../models/Transaction';
import uploadConfig from '../config/upload';
import GetBalanceService from '../services/GetBalanceService';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactions = await getRepository(Transactions).find({
    relations: ['category'],
  });
  // const transactions = await getRepository(Transactions).find();
  const getBalance = new GetBalanceService();

  const balance = await getBalance.execute();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute({ id });
  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;

    const updateCsv = new ImportTransactionsService();

    const transactions = await updateCsv.execute({ filename });

    return response.json(transactions);
  },
);

export default transactionsRouter;
