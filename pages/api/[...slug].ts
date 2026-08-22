import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../server/index';

// We catch all requests and pass them to the express app instance
export default function handler(req: NextApiRequest, res: NextApiResponse) {

  return app(req, res);
}

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};
