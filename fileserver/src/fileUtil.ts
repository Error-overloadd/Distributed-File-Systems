import fs from 'fs';

// Function to convert file to Base64 string
export async function fileToBase64(filePath: string): Promise<string> {
  const fileContent = await fs.promises.readFile(filePath, { encoding: 'binary' });
  const base64Encoded = Buffer.from(fileContent, 'binary').toString('base64');
  return base64Encoded;
}

// Function to convert Base64 string to file
export async function base64ToFile(base64String: string, filePath: string): Promise<void> {
  const fileContent = Buffer.from(base64String, 'base64').toString('binary');
  await fs.promises.writeFile(filePath, fileContent, { encoding: 'binary' });
}

