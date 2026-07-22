import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';

export const getAnalyticsSummaryHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await FeedbackService.getAnalyticsSummary();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
