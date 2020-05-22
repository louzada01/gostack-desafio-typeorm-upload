import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import GetBalanceService from './GetBalanceService';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}
interface InterfaceTransaction {
  title: string;
  value: number;
  type: string;
  category_id: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<InterfaceTransaction> {
    const getBalanceService = new GetBalanceService();
    const balance = await getBalanceService.execute();
    if (value > balance.total && type === 'outcome') {
      throw new AppError(
        'Not able to create transaction without a valid balance',
        400,
      );
    }
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const checkCategorysExists = await categoryRepository.findOne({
      where: { title: category },
    });
    let newCategoria = { title: category };
    if (checkCategorysExists) {
      newCategoria = Object.assign(newCategoria, {
        id: checkCategorysExists.id,
      });
    }

    const createdCategory = await categoryRepository.save(newCategoria);
    const newTransaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: createdCategory.id,
    });

    const createdTrasaction = await transactionRepository.save(newTransaction);

    return createdTrasaction;
  }
}

export default CreateTransactionService;
