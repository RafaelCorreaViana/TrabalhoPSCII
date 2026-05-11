import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Não autorizado. Por favor, faça login.' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Não autorizado. Por favor, faça login.' });
    }

    if (!req.session.role || !roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    next();
  };
};
