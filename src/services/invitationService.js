import ApiError from '../utils/ApiError.js';
import { userModel } from '../models/userModel.js';
import { boardModel } from '../models/boardModel.js';
import { invitationModel } from '../models/invitationModel.js';
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '../utils/constants.js';
import { pickUser } from '../utils/formater.js';
import { StatusCodes } from 'http-status-codes';

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Find the inviter (requester)
    const inviter = await userModel.findOneById(inviterId);

    // Find the invitee by email
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail);

    // Find the board by ID
    const board = await boardModel.findOneById(reqBody.boardId);

    // If any of them are missing, throw an error
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!');
    }

    // Create the invitation data
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    };

    // Save the invitation
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData);
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString());

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) {
    throw error;
  }
};
const getInvitations = async (userId) => {
  try {
    // Find all invitations for the user
    const invitations = await invitationModel.findAllByUserId(userId);
    
    console.log('invitations', invitations);

    // Normalize data structure
    const resInvitation = invitations.map(invite => ({
      ...invite,
      board: invite.board[0] || {},
      inviter: invite.inviter[0] || {},
      invitee: invite.invitee[0] || {}
    }));

    return resInvitation;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Find the invitation by ID
    const invitation = await invitationModel.findOneById(invitationId);

    // If the invitation is not found, throw an error
    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!');
    }

    const boardId = invitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);

    
    if (!getBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');
    }

    const boardOwnerAndMembersIds = [...getBoard.ownerIds, ...getBoard.memberIds].map(id => id.toString());

    console.log('boardOwnerAndMembersIds', boardOwnerAndMembersIds);

    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMembersIds.includes(userId)) {
      // Update the invitation status to accepted
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already a member of this board!');
    }

    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status: status
      }
    }

    const updatedInvitation = await invitationModel.update(invitationId, updateData);

    console.log('updatedInvitation', updatedInvitation);

    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      // Add the user to the board's members if the invitation is accepted
      await invitationModel.pushMemberIds(boardId, userId);
    }

    return updatedInvitation
  } catch (error) {
    throw error;
  }
}


export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
};
