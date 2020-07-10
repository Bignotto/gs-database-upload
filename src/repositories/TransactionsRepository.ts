import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    if (!transactions) return { income: 0, outcome: 0, total: 0 };

    const incomes = transactions.filter(({ type }) => type === 'income');
    let incomeTotal = 0;
    if (incomes.length > 0) {
      const incomesToSum = incomes.map(({ value }) => Number(value));
      incomeTotal = incomesToSum.reduce((sum, t) => sum + t);
    }

    const outcomes = transactions.filter(({ type }) => type === 'outcome');
    let outcomeTotal = 0;
    if (outcomes.length > 0) {
      const outcomesToSum = outcomes.map(({ value }) => Number(value));
      outcomeTotal = outcomesToSum.reduce((sum, t) => sum + t);
    }

    const total = incomeTotal - outcomeTotal;
    return { income: incomeTotal, outcome: outcomeTotal, total };
  }
}
export default TransactionsRepository;
