import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import Category from '../models/Category';

interface ResponseCategory {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}
interface ResponseTransaction {
  title: string;
  type: string;
  value: number;
  category: ResponseCategory;
}

interface InputTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({
    filename,
  }: {
    filename: string;
  }): Promise<ResponseTransaction[]> {
    const csvPath = path.join(uploadConfig.directory, filename);
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);
    const inputTransactions: InputTransaction[] = [];

    const input = fs.createReadStream(csvPath);

    const parsers = csvParse({
      from_line: 2,
    });

    const csvReading = input.pipe(parsers);

    csvReading.on('data', async row => {
      const [title, type, value, category] = row.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      inputTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => csvReading.on('end', resolve));
    const inputCategories = inputTransactions.map(row => row.category);
    const existentsCategories = await categoriesRepository.find({
      where: {
        title: In(inputCategories),
      },
    });
    const existentsCategoriesTitle = existentsCategories.map(
      (category: Category) => category.title,
    );
    const newInputCategories = inputCategories
      .filter(value => !existentsCategoriesTitle.includes(value))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      newInputCategories.map(title => ({ title })),
    );

    const newCreatedCategories = await categoriesRepository.save(newCategories);

    const categoriesToAdd = [...existentsCategories, ...newCreatedCategories];

    const transactions = transactionsRepository.create(
      inputTransactions.map(row => ({
        title: row.title,
        type: row.type,
        value: row.value,
        category: categoriesToAdd.find(
          category => category.title === row.category,
        ),
      })),
    );
    await transactionsRepository.save(transactions);

    await fs.promises.unlink(csvPath);

    return transactions;
  }
}

export default ImportTransactionsService;
