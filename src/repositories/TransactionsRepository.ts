import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const repositoryTransaction = getRepository(Transaction);
    const { income } = await repositoryTransaction
      .createQueryBuilder('transactions')
      .select('SUM(transactions.income)', 'income')
      .where('transactions.type = "income"')
      .getRawOne();
    const { outcome } = await repositoryTransaction
      .createQueryBuilder('transactions')
      .select('SUM(transactions.income)', 'outcome')
      .where('transactions.type = "income"')
      .getRawOne();

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };
    return balance;
  }
}

export default TransactionsRepository;
