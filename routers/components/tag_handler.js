var ModelTag = require('../../models/model_tag');
var ModelTagUseMap = require('../../models/model_tag_use_map');
var ModelMate = require('../../models/model_mate');

async function postTagsMate(mateId, userId, tags) {

    return new Promise(async (resolve, reject) => {
        if(tags == null) {
            reject();
        }
    
        var modelMate = await ModelMate.findById(mateId);
    
        for(var i=0; i<tags.length; i++) {
    
            var tag = await ModelTag.findOne({tag: tags[i]});
            if(tag == null) {
                tag = ModelTag();
                tag.tag = tags[i];
            }
    
            tag.count++;
            tag = await tag.save();
            modelMate.tags.push(tag);
    
            var tagmap = ModelTagUseMap();
            tagmap.mate = mateId;
            tagmap.user = userId;
            tagmap.tag = tag.id;
            await tagmap.save()
    
        }
    
        modelMate.save()
        .then((_) => resolve())
        .catch((_) => reject())
    });

   
}

module.exports = {
    postTagsMate: postTagsMate,
}