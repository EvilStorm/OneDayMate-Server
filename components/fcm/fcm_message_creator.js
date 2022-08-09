const ModelUser = require('../../models/model_user');

const MessageType = {
  SYSTEM: 'system',
  ACTION: 'action',
  APPLIED: 'applied',
  APPLY_CANCEL: 'apply_cancel',
  ACCEPT: 'accept',
  DENIED: 'denied',
  REPLY: 'reply',
  LIKE: 'like',
  POSTING: 'posting',
  AWARD: 'award',
  CHAT: 'chat',
};

const actionsMessage = {
  applied: {
    title: '스타일메이트',
    body: '내 메이트에 참가 신청한 사람이 있습니다.',
  },
  apply_cancel: {
    title: '스타일메이트',
    body: '참가 신청 취소한 사람이 있습니다.',
  },
  accept: {
    title: '스타일메이트',
    body: '메이트에 참여 승인 되었습니다.',
  },
  denied: {
    title: '스타일메이트',
    body: '메이트에 참여 거절 되었습니다.',
  },
};
async function createMessage(targetId, type) {
  if (!MessageType) {
    throw new Error('MessageType is Not support!!!');
  }

  console.log(type);
  switch (type) {
    case MessageType.SYSTEM:
      return await createSystemMessage(targetId, type);
    case MessageType.ACTION:
      return await createActionMessage(targetId, type);
    case MessageType.REPLY:
      return await createReplyMessage(targetId, type);
    case MessageType.LIKE:
      return await createLikeMessage(targetId, type);
    case MessageType.CHAT:
      return await createChatMessage(targetId, type);
    case MessageType.POSTING:
    case MessageType.APPLIED:
    case MessageType.APPLY_CANCEL:
    case MessageType.ACCEPT:
    case MessageType.DENIED:
      return await createActionsMessage(targetId, type);
  }
}
async function createActionsMessage(targetId, type) {
  var result = await ModelUser.findById(targetId);

  var fcmToken = result.pushToken == null ? testToken : result.pushToken;
  const pushInfos = {
    notification: actionsMessage[type],
    data: {
      type: type,
    },
    token: fcmToken,
  };

  // console.log(pushInfos);
  return pushInfos;
}

function createSystemMessage(targetId, msgType) {}
function createActionMessage(targetId, msgType) {}

const testToken =
  'dZdc9ARjHQU:APA91bEjSyKWMnz7bEE4nhID8JWO263hw2TfuA8l6MT9TYb47737JPwLsOQyuEU9IQSIQFFjXYgVWaP5edAhZ2hGnf0IicZR5CH-A3rGIX4Pad-gy-cbZrBLJ78C6olvoAXzV1TWMMIO';

/**
 * 글에 댓글이 달렸을 때 메시지
 * @param {DailyDress Object ID} targetId
 */
async function createReplyMessage(targetId, msgType) {
  var result = await ModelUser.findById(targetId).exec();

  var fcmToken = result.pushToken == null ? testToken : result.pushToken;
  const pushInfos = {
    notification: {
      title: '스타일메이트',
      body: '내 스타일을 좋아하는 분이 있나봐요. 뎃글이 달렸어요!!.',
    },
    data: {
      type: msgType,
    },
    token: fcmToken,
  };
  return pushInfos;
}

/**
 * 좋아요 알림.
 * @param {DailyDress Object ID} targetId
 */
async function createLikeMessage(targetId, msgType) {
  var result = await ModelUser.findById(targetId);

  var fcmToken = result.pushToken == null ? testToken : result.pushToken;
  const pushInfos = {
    notification: {
      title: '스타일메이트',
      body: '내 스일을 좋아하는 분이 있나봐요. 하트하트!',
    },
    data: {
      type: msgType,
    },
    token: fcmToken,
  };

  return pushInfos;
}

/**
 * 사용자가 옷 등록 시 참고하는 사람들에게 알림을 보낸다.
 * @param {사용자 ID} targetId
 */
function createPostingMessage(targetId, msgType) {}

module.exports = {
  MessageType: MessageType,
  createMessage: createMessage,
};
