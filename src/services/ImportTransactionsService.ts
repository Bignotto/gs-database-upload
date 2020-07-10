import { getCustomRepository, getRepository, In } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  csvFile: string;
}

interface Line {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFile }: Request): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csvFile);

    let transactions: Line[] = [];
    let categories: string[] = [];

    const data = await this.loadCSV(csvFilePath);

    categories = data.map(line => line[3]);

    transactions = data.map(line => {
      return {
        title: line[0],
        value: line[2],
        type: line[1],
        category: line[3],
      };
    });

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const categoryTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategories = categories.filter(
      category => !categoryTitles.includes(category),
    );

    const uniqueCategories = addCategories.filter(
      (v, i, a) => a.indexOf(v) === i,
    );

    const addedCategories = categoryRepository.create(
      uniqueCategories.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(addedCategories);

    const allCategories = [...existentCategories, ...addedCategories];

    const newTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(newTransactions);

    await fs.promises.unlink(csvFilePath);

    return newTransactions;
  }

  private async loadCSV(filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: string[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
