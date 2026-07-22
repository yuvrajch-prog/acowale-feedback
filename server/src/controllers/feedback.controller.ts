import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';
import { AppError } from '../middleware/errorHandler';

export const createFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedback = await FeedbackService.createFeedback(req.body);
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const listFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as any;
    const result = await FeedbackService.listFeedback(query);
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await FeedbackService.updateStatus(id, status);
    if (!updated) {
      throw new AppError(`Feedback with ID '${id}' not found`, 404);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deleted = await FeedbackService.deleteFeedback(id);
    if (!deleted) {
      throw new AppError(`Feedback with ID '${id}' not found`, 404);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback soft-deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
