import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionInterface {
  id: string;
  title: string;
  type: string;
  value: number;
  created_at: Date;
  updated_at: Date;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeTransactions = await this.find({
      where: { type: 'income' },
    });
    let incomeTotal = 0;
    console.log(incomeTransactions);
    if (incomeTransactions.length > 0) {
      const incomeToSum = incomeTransactions.map(({ value }) => value);
      incomeTotal = incomeToSum.reduce((sum, value) => {
        return sum + value;
      });
    }
    const outcomeTransactions = await this.find({
      where: { type: 'outcome' },
    });
    let outcomeTotal = 0.0;
    if (outcomeTransactions.length > 0) {
      const outcomeToSum = outcomeTransactions.map(({ value }) => value);
      outcomeTotal = outcomeToSum.reduce((sum, value) => {
        return sum + value;
      });
    }
    //subtract outcome from income
    const result = incomeTotal - outcomeTotal;
    const balance = {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: result,
    };
    return balance;
  }
}

export default TransactionsRepository;
