import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';

export const getAnalyticsSummaryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const summary = await FeedbackService.getAnalyticsSummary({ startDate, endDate });
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
