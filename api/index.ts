import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({ message: "盲生，你发现了华点，不过好像并没有什么用处呢🤔" });
};