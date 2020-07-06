import { getCustomRepository, getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

//import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    await transactionRepository.delete({ id });
    console.log('deletou');
    return;
    // TODO
  }
}

export default DeleteTransactionService;
