import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute({ id }: { id: string }): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    await transactionRepository.delete({ id });
  }
}

export default DeleteTransactionService;
