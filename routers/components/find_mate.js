var mongoose = require('mongoose');
var DBConst = require('../../db/constant');
var ModelMate = require('../../models/model_mate');
var ModelTagUseMap = require('../../models/model_tag_use_map');
var ModelTag = require('../../models/model_tag');

const userBriefSelect = '_id nickName pictureMe';
const mateBriefSelect = '_id images title message memberLimit locationStr mateDate category createdAt';
const mateDetailPopulate = [
  {
    path: 'member',
    select: 'member',
    populate: [
      {
        path: 'appliedMember',
        select: userBriefSelect,
      },
      {
        path: 'acceptedMember',
        select: userBriefSelect,
      },
      {
        path: 'deniedMember',
        select: userBriefSelect,
      },
    ],
  },
  {
    path: 'owner',
    select: userBriefSelect,
  },

  {
    path: 'tags',
  },
];

const mateBriefPopulate = [
  {
    path: 'member',
    select: 'member',
    populate: [
      {
        path: 'acceptedMember',
        select: userBriefSelect,
      },
    ],
  },
  {
    path: 'category',
    select: '_id category',
  },

  {
    path: 'owner',
    select: userBriefSelect,
  },
];

const getMateDetail = async (mateId) => {
  const id = mateId;
  return new Promise((resolve, reject) => {
    ModelMate.findById(id)
      .populate(mateDetailPopulate)
      .then((_) => resolve(_))
      .catch((_) => {
        reject(_);
      });
  });
};

const getMateBerif = async (mateId) => {
  const id = mateId;
  return new Promise((resolve, reject) => {
    ModelMate.findById(id)
      .select(mateBriefSelect)
      .populate(mateBriefPopulate)
      .then((_) => resolve(_))
      .catch((_) => {
        reject(_);
      });
  });
};

const getMateBriefWithCondition = async (
  where = {},
  page = 0,
  limitCount = DBConst.PAGE_COUNT,
  sort = { createdAt: -1 }
) => {
  const tempWhere = where;
  const tempPage = page;
  const tempLimitCount = limitCount;
  const tempSort = sort;
  return new Promise((resolve, reject) => {
    ModelMate.find(tempWhere)
      .select(mateBriefSelect)
      .populate(mateBriefPopulate)
      .skip(DBConst.PAGE_COUNT * tempPage)
      .limit(tempLimitCount)
      .sort(tempSort)
      .then((_) => resolve(_))
      .catch((_) => {
        reject(_);
      });
  });
};

const getMateByTag = async (tagName) => {
  const tag = tagName;
  return new Promise(async (resolve, reject) => {
    try {
      const searchTag = await ModelTag.findOne({
        tag: tag,
      }).exec();

      const result = await ModelTagUseMap.find({
        tag: searchTag._id,
      })
        .populate({
          path: 'mate',
          select: mateBriefSelect,
          populate: mateBriefPopulate,
        })
        .select('_id mate')
        .exec();

      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getMateDetail,
  getMateBerif,
  getMateByTag,
  getMateBriefWithCondition,
};
