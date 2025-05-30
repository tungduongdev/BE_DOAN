import { StatusCodes } from 'http-status-codes';
import { invitationService } from '../services/invitationService.js';

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // The user making the request is the inviter
    const inviterId = req.jwtDecoded._id;

    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId);

    res.status(StatusCodes.CREATED).json(resInvitation);
  } catch (error) {
    next(error);
  }
};

const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const invitations = await invitationService.getInvitations(userId);
    res.status(StatusCodes.OK).json(invitations);
  } catch (error) {
    next(error);
  }
};

const updateBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const {invitationId} = req.params;
    const {status} = req.body;

    const updatedInvitation = await invitationService.updateBoardInvitation(userId, invitationId, status);
    res.status(StatusCodes.OK).json(updatedInvitation);
  } catch (error) {
    next(error);
  }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
};
