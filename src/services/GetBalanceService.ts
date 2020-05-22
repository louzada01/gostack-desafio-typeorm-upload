import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class GetBalanceService {
  public async execute(): Promise<Balance> {
    const repositoryTransaction = getRepository(Transaction);
    const { income } = await repositoryTransaction
      .createQueryBuilder('transactions')
      .select('SUM(value)', 'income')
      .where('transactions.type = :item', { item: 'income' })
      .getRawOne();
    const { outcome } = await repositoryTransaction
      .createQueryBuilder('transactions')
      .select('SUM(value)', 'outcome')
      .where('transactions.type  = :item', { item: 'outcome' })
      .getRawOne();

    const balance = {
      income: Number(income),
      outcome: Number(outcome),
      total: Number(income) - Number(outcome),
    };
    return balance;
  }
}

export default GetBalanceService;
