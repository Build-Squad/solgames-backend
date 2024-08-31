import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export async function generateUniqueCode(
  repository: Repository<any>,
  column: string = 'code',
  length: number = 10,
): Promise<string> {
  const code = uuidv4().replace(/-/g, '').slice(0, length).toUpperCase();
  const existingCode = await repository.findOne({ where: { [column]: code } });

  if (existingCode) {
    // Recursively generate a new code if it already exists
    return generateUniqueCode(repository, column, length);
  }

  return code;
}
