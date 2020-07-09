import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';

interface Request {
  csvFile: string;
}

class ImportTransactionsService {
  async execute({ csvFile }: Request): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csvFile);
    // const readCSVStream = fs.createReadStream(csvFilePath);
    const createTransaction = new CreateTransactionService();
    const data = await this.loadCSV(csvFilePath);

    const imported = data.map(async line => {
      return await createTransaction.execute({
        title: line[0],
        value: line[2],
        type: line[1],
        category: line[3],
      });
    });

    console.log(imported);
    // const imported: Transaction[] = [];
    // await data.forEach(async line => {
    //   console.log(line);
    //   imported.push(
    //     await createTransaction.execute({
    //       title: line[0],
    //       value: line[2],
    //       type: line[1],
    //       category: line[3],
    //     }),
    //   );
    // });

    return await Promise.all(imported);
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
