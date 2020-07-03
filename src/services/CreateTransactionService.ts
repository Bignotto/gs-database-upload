import { getCustomRepository, getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';

// import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    //testa se category já existe
    //se não existe cria
    // const categoryRepository = getRepository(Category);
    // const checkCategory = await categoryRepository.findOne({
    //   where: { title: category },
    // });
    // if (!checkCategory) {
    // }
    //valida valor com saldo
    //erro se não puder
    //salva no banco
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
