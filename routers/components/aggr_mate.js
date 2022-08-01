var mongoose = require('mongoose');
var DBConst = require('../../db/constant');

var ModelTag = require('../../models/model_tag');
var ModelMate = require('../../models/model_mate');
var ModelCategory = require('../../models/model_category');
var ModelUser = require('../../models/model_user');
const ModelMateMember = require('../../models/model_mate_member');

const breifMemberProject = {
  _id: 1,
  nickName: 1,
  pictureMe: 1,
};

const breifMateProject = {
  _id: 1,
  images: 1,
  title: 1,
  message: 1,
  memberLimit: 1,
  mateDate: 1,
  locationStr: 1,
  isShow: 1,
  createdAt: 1,
};

const memberBriefLookUp = (name, foregin, local, as) => {
  return {
    $lookup: {
      from: name,
      foreignField: foregin,
      localField: local,
      as: as,
      pipeline: [
        {
          $project: breifMemberProject,
        },
      ],
    },
  };
};

async function getMateDetail(
  uId,
  match = { isShow: true },
  page = 0,
  limitCount = DBConst.PAGE_COUNT,
  sort = { createdAt: -1 }
) {
  try {
    var mate = await ModelMate.aggregate([
      {
        $lookup: {
          from: ModelUser.collection.name,
          foreignField: '_id',
          localField: 'owner',
          as: 'user',
          pipeline: [
            {
              $project: breifMemberProject,
            },
          ],
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: ModelCategory.collection.name,
          foreignField: '_id',
          localField: 'category',
          as: 'category',
          pipeline: [
            {
              $project: {
                _id: 1,
                category: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: ModelTag.collection.name,
          foreignField: '_id',
          localField: 'tags',
          as: 'tag',
          pipeline: [
            {
              $project: {
                _id: 1,
                tag: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: ModelMateMember.collection.name,
          foreignField: '_id',
          localField: 'member',
          as: 'mem',
          pipeline: [
            memberBriefLookUp(ModelUser.collection.name, '_id', 'appliedMember', 'applym'),
            memberBriefLookUp(ModelUser.collection.name, '_id', 'acceptedMember', 'am'),
            memberBriefLookUp(ModelUser.collection.name, '_id', 'deniedMember', 'dm'),
            {
              $project: {
                appliedMember: '$applym',
                acceptedMember: '$am',
                deniedMember: '$dm',
              },
            },
          ],
        },
      },
      {
        $unwind: '$mem',
      },
      {
        $project: Object.assign(breifMateProject, {
          isLike: { $in: [mongoose.Types.ObjectId(uId), { $ifNull: ['$like', []] }] },
          owner: '$user',
          tags: '$tag',
          member: '$mem',
        }),
      },
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $skip: DBConst.PAGE_COUNT * page,
      },
      {
        $limit: limitCount,
      },
    ]);
    // console.log(` mate: ${JSON.stringify(mate)}`);
    return mate;
  } catch (e) {
    console.log(e);
    return e;
  }
}

async function getMateBrief(
  uId,
  match = { isShow: true },
  page = 0,
  limitCount = DBConst.PAGE_COUNT,
  sort = { createdAt: -1 }
) {
  try {
    var mate = await ModelMate.aggregate([
      {
        $lookup: {
          from: ModelUser.collection.name,
          foreignField: '_id',
          localField: 'owner',
          as: 'user',
          pipeline: [
            {
              $project: breifMemberProject,
            },
          ],
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: ModelCategory.collection.name,
          foreignField: '_id',
          localField: 'category',
          as: 'category',
          pipeline: [
            {
              $project: {
                _id: 1,
                category: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: ModelTag.collection.name,
          foreignField: '_id',
          localField: 'tags',
          as: 'tag',
          pipeline: [
            {
              $project: {
                _id: 1,
                tag: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: ModelMateMember.collection.name,
          foreignField: '_id',
          localField: 'member',
          as: 'mem',
          pipeline: [
            memberBriefLookUp(ModelUser.collection.name, '_id', 'appliedMember', 'applym'),
            memberBriefLookUp(ModelUser.collection.name, '_id', 'acceptedMember', 'am'),
            memberBriefLookUp(ModelUser.collection.name, '_id', 'deniedMember', 'dm'),
            {
              $project: {
                appliedMember: '$applym',
                acceptedMember: '$am',
                deniedMember: '$dm',
              },
            },
          ],
        },
      },
      {
        $unwind: '$mem',
      },
      {
        $project: Object.assign(breifMateProject, {
          isLike: { $in: [mongoose.Types.ObjectId(uId), { $ifNull: ['$like', []] }] },
          owner: '$user',
          tags: '$tag',
          member: '$mem',
          category: '$category',
        }),
      },
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $skip: DBConst.PAGE_COUNT * page,
      },
      {
        $limit: limitCount,
      },
    ]);
    // console.log(` mate: ${JSON.stringify(mate)}`);
    return mate;
  } catch (e) {
    console.log(e);
    return e;
  }
}
module.exports = {
  getMateDetail,
  getMateBrief,
};
