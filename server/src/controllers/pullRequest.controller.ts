import { Response } from 'express';
import { AppRequest } from '../types/index';
import { PullRequestService } from '../services/pullRequest.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { ReviewDecisionType } from '@workspace/shared-types';
import {
  createPRSchema,
  updatePRSchema,
  assignReviewersSchema,
  createPRCommentSchema,
  updatePRCommentSchema,
  prListQuerySchema,
} from '../validators/pullRequest.validator';

const prService = new PullRequestService();

export class PullRequestController {
  static createPullRequest = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const validated = createPRSchema.parse(req.body);

    const pr = await prService.createPullRequest(orgId, userId, validated);
    res
      .status(201)
      .json(createSuccessResponse(pr, 'Pull Request created successfully', req.requestId || 'N/A'));
  };

  static getPullRequests = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const query = prListQuerySchema.parse(req.query);

    const result = await prService.getPullRequests(orgId, query);
    res
      .status(200)
      .json(
        createSuccessResponse(
          result,
          'Pull Requests retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getDashboardStats = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;

    const stats = await prService.getDashboardStats(orgId, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(
          stats,
          'PR Dashboard stats retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getPullRequestById = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const pr = await prService.getPullRequestById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(pr, 'Pull Request retrieved successfully', req.requestId || 'N/A')
      );
  };

  static updatePullRequest = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = updatePRSchema.parse(req.body);

    const updated = await prService.updatePullRequest(orgId, id, userId, validated);
    res
      .status(200)
      .json(
        createSuccessResponse(updated, 'Pull Request updated successfully', req.requestId || 'N/A')
      );
  };

  static deletePullRequest = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await prService.deletePullRequest(orgId, id, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Pull Request deleted successfully', req.requestId || 'N/A')
      );
  };

  static submitForReview = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const updated = await prService.submitForReview(orgId, id, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(updated, 'Pull Request submitted for review', req.requestId || 'N/A')
      );
  };

  static approvePR = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { comment } = req.body || {};

    const updated = await prService.recordDecision(
      orgId,
      id,
      userId,
      ReviewDecisionType.APPROVED,
      comment
    );
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Pull Request approved', req.requestId || 'N/A'));
  };

  static rejectPR = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { comment } = req.body || {};

    const updated = await prService.recordDecision(
      orgId,
      id,
      userId,
      ReviewDecisionType.REJECTED,
      comment
    );
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Pull Request rejected', req.requestId || 'N/A'));
  };

  static requestChanges = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { comment } = req.body || {};

    const updated = await prService.recordDecision(
      orgId,
      id,
      userId,
      ReviewDecisionType.CHANGES_REQUESTED,
      comment
    );
    res
      .status(200)
      .json(
        createSuccessResponse(updated, 'Changes requested for Pull Request', req.requestId || 'N/A')
      );
  };

  static mergePR = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const merged = await prService.mergePullRequest(orgId, id, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(merged, 'Pull Request merged successfully', req.requestId || 'N/A')
      );
  };

  static addReviewers = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { reviewerIds } = assignReviewersSchema.parse(req.body);

    let updatedPr: any = null;
    for (const reviewerId of reviewerIds) {
      updatedPr = await prService.addReviewer(orgId, id, userId, reviewerId);
    }

    res
      .status(200)
      .json(
        createSuccessResponse(updatedPr, 'Reviewers assigned successfully', req.requestId || 'N/A')
      );
  };

  static removeReviewer = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id, reviewerId } = req.params;

    const updated = await prService.removeReviewer(orgId, id, userId, reviewerId);
    res
      .status(200)
      .json(
        createSuccessResponse(updated, 'Reviewer removed successfully', req.requestId || 'N/A')
      );
  };

  static getReviewers = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const pr = await prService.getPullRequestById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          pr.reviewers || [],
          'Reviewers retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static addComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { message } = createPRCommentSchema.parse(req.body);

    const comment = await prService.addComment(orgId, id, userId, message);
    res
      .status(201)
      .json(createSuccessResponse(comment, 'Comment added successfully', req.requestId || 'N/A'));
  };

  static getComments = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const pr = await prService.getPullRequestById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          pr.comments || [],
          'Comments retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static updateComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const { message } = updatePRCommentSchema.parse(req.body);

    const comment = await prService.updateComment(orgId, id, userId, message);
    res
      .status(200)
      .json(createSuccessResponse(comment, 'Comment updated successfully', req.requestId || 'N/A'));
  };

  static deleteComment = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await prService.deleteComment(orgId, id, userId);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Comment deleted successfully', req.requestId || 'N/A'));
  };

  static getVersions = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const pr = await prService.getPullRequestById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          pr.versions || [],
          'Versions retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getActivityTimeline = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const { id } = req.params;

    const pr = await prService.getPullRequestById(orgId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(
          pr.activities || [],
          'Activity timeline retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };
}
